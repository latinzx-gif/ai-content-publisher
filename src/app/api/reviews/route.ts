import { NextResponse } from 'next/server';
import { requireApiActor, requireContentAccess, requireTeamPermission } from '@/lib/server/apiSecurity';
import { buildPrdPresentation } from '@/lib/prdPresentation';
import { attachSignedAssetUrls } from '@/lib/server/contentAssetStorage';
import { writeAuditEvent } from '@/lib/server/audit';
import { fetchWorkflowTraceMap } from '@/lib/server/workflowTrace';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CreateReviewBody = {
  contentItemId?: string;
  reviewType?: 'legal' | 'tax' | 'accounting' | 'brand' | 'translation';
  riskLevel?: 'low' | 'medium' | 'high';
  assignedReviewer?: string;
  dueAt?: string;
};

type ContentTranslationRow = {
  content_item_id: string;
  language: string;
  title: string | null;
  body: string | null;
  status: string | null;
  created_at: string | null;
};

type ContentAssetRow = {
  id: string | null;
  content_item_id: string;
  asset_type: string;
  layout_type: string | null;
  url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  source: string | null;
  sort_order: number;
  metadata: Record<string, unknown> | null;
};

const reviewTypes = ['legal', 'tax', 'accounting', 'brand', 'translation'] as const;
const riskLevels = ['low', 'medium', 'high'] as const;

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbiddenReviewPermission = await requireTeamPermission(supabase, actor, 'can_review');
    const forbiddenCreatePermission = await requireTeamPermission(supabase, actor, 'can_create');

    if (forbiddenReviewPermission && forbiddenCreatePermission) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Missing required permission: can_review or can_create',
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit') ?? '50');
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50;

    let query = supabase
      .from('review_items')
      .select('id,content_item_id,review_type,status,risk_level,assigned_reviewer,due_at,created_at,updated_at,content_items(id,title,service_area,status,risk_level,metadata)')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reviews, error: reviewError } = await query;

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    const reviewerIds = Array.from(new Set((reviews ?? []).map((review) => review.assigned_reviewer).filter(Boolean)));
    const reviewerMap = new Map<string, string>();
    const contentItemIds = Array.from(new Set((reviews ?? []).map((review) => review.content_item_id).filter(Boolean)));
    const translationsByContentItem = new Map<string, ContentTranslationRow[]>();
    const assetsByContentItem = new Map<string, ContentAssetRow[]>();
    const taskTraceMap = await fetchWorkflowTraceMap(supabase, contentItemIds);

    if (reviewerIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id,display_name')
        .in('id', reviewerIds);

      if (profileError) {
        throw new Error(profileError.message);
      }

      (profiles ?? []).forEach((profile) => {
        reviewerMap.set(profile.id, profile.display_name || 'Reviewer');
      });
    }

    if (contentItemIds.length > 0) {
      const [translationsResult, assetsResult] = await Promise.all([
        supabase
          .from('content_translations')
          .select('content_item_id,language,title,body,status,created_at')
          .in('content_item_id', contentItemIds)
          .order('created_at', { ascending: true }),
        supabase
          .from('content_assets')
          .select('id,content_item_id,asset_type,layout_type,url,storage_path,alt_text,source,sort_order,metadata')
          .in('content_item_id', contentItemIds)
          .order('sort_order', { ascending: true }),
      ]);

      if (translationsResult.error) {
        throw new Error(translationsResult.error.message);
      }

      if (assetsResult.error) {
        throw new Error(assetsResult.error.message);
      }

      for (const row of (translationsResult.data ?? []) as ContentTranslationRow[]) {
        const current = translationsByContentItem.get(row.content_item_id) ?? [];
        current.push(row);
        translationsByContentItem.set(row.content_item_id, current);
      }

      const signedAssets = await attachSignedAssetUrls(supabase, (assetsResult.data ?? []) as ContentAssetRow[]);

      for (const row of signedAssets) {
        const current = assetsByContentItem.get(row.content_item_id) ?? [];
        current.push(row);
        assetsByContentItem.set(row.content_item_id, current);
      }
    }

    return NextResponse.json({
      reviews: (reviews ?? []).map((review) => {
        const contentItem = Array.isArray(review.content_items) ? review.content_items[0] : review.content_items;
        const contentItemMetadata = contentItem?.metadata && typeof contentItem.metadata === 'object' ? contentItem.metadata : {};
        const generatedDrafts =
          translationsByContentItem.get(review.content_item_id)?.map((translation) => ({
            languageCode: translation.language,
            languageLabel: translation.language,
            title: translation.title,
            body: translation.body,
            status: translation.status,
            createdAt: translation.created_at,
          })) ?? contentItemMetadata.generatedDrafts;
        const generatedAssets = assetsByContentItem.get(review.content_item_id) ?? [];
        const taskTrace = taskTraceMap.get(review.content_item_id) ?? [];
        const hasRealImageOutput = generatedAssets.some(
          (asset) =>
            asset.metadata?.generatedAssetPlaceholder !== true &&
            (asset.metadata?.durableAssetReference === true || typeof asset.storage_path === 'string'),
        );

        const presentationData = buildPrdPresentation({
          title: contentItem?.title,
          subtitle: contentItem?.service_area ?? review.review_type,
          platform:
            Array.isArray(contentItemMetadata.platforms) && contentItemMetadata.platforms.length > 0
              ? contentItemMetadata.platforms.join(', ')
              : contentItem?.service_area ?? review.review_type,
          status: review.status,
          priority: review.risk_level ?? contentItem?.risk_level ?? null,
          metadata: contentItemMetadata,
          generatedDrafts,
          generatedAssets,
          updatedAt: review.updated_at,
          dueAt: review.due_at,
          agentName: review.assigned_reviewer ? reviewerMap.get(review.assigned_reviewer) ?? 'Reviewer' : undefined,
        });

        return {
          ...review,
          content_items: contentItem
            ? {
                ...contentItem,
                metadata: {
                  ...contentItemMetadata,
                  generatedDrafts,
                  generatedAssets,
                  imageCount: generatedAssets.length > 0 ? generatedAssets.length : contentItemMetadata.imageCount,
                },
              }
            : contentItem,
          reviewer_name: review.assigned_reviewer ? reviewerMap.get(review.assigned_reviewer) ?? 'Reviewer' : 'Unassigned reviewer',
          taskTrace,
          latestTaskTrace: taskTrace[0] ?? null,
          hasRealImageOutput,
          presentation: presentationData.presentation,
          drafts: presentationData.drafts,
          assets: presentationData.assets,
          // Explicitly omit debug data to prevent technical leaks to user-facing surfaces
        };
      }),
      count: reviews?.length ?? 0,
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'List reviews failed',
      source: 'reviews_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_create');

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json()) as CreateReviewBody;

    if (!body.contentItemId || !body.reviewType) {
      return NextResponse.json({ error: 'contentItemId and reviewType are required' }, { status: 400 });
    }

    if (!reviewTypes.includes(body.reviewType)) {
      return NextResponse.json({ error: 'reviewType must be legal, tax, accounting, brand, or translation' }, { status: 400 });
    }

    if (body.riskLevel && !riskLevels.includes(body.riskLevel)) {
      return NextResponse.json({ error: 'riskLevel must be low, medium, or high' }, { status: 400 });
    }

    if (body.dueAt && !isIsoDateTime(body.dueAt)) {
      return NextResponse.json({ error: 'dueAt must be a valid ISO date string' }, { status: 400 });
    }

    const inaccessible = await requireContentAccess(supabase, actor, body.contentItemId);

    if (inaccessible) {
      return inaccessible;
    }

    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('id, title, risk_level')
      .eq('id', body.contentItemId)
      .single();

    if (contentError) {
      throw new Error(contentError.message);
    }

    const assignedReviewer = body.assignedReviewer ?? actor.profileId;
    const reviewerValid = await isActiveReviewer(supabase, assignedReviewer);

    if (!reviewerValid) {
      return NextResponse.json({ error: 'assignedReviewer must be an active reviewer' }, { status: 400 });
    }

    const riskLevel = body.riskLevel ?? contentItem.risk_level ?? 'low';
    const { data: result, error: reviewError } = await supabase.rpc('create_review_item_atomic', {
      p_content_item_id: body.contentItemId,
      p_review_type: body.reviewType,
      p_risk_level: riskLevel,
      p_assigned_reviewer: assignedReviewer,
      p_due_at: body.dueAt ?? null,
    });

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'review.created',
      targetType: 'review_item',
      targetId: result?.review?.id ?? null,
      metadata: {
        contentItemId: body.contentItemId,
        title: contentItem.title,
        reviewType: body.reviewType,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Create review failed',
      source: 'reviews_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function isActiveReviewer(supabase: ReturnType<typeof createSupabaseServerClient>, profileId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('id')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .eq('can_review', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

function isIsoDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}
