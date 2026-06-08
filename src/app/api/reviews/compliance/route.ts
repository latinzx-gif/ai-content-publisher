import { NextResponse } from 'next/server';
import { buildComplianceAssessment } from '@/lib/reviews/compliance';
import { requireApiActor, requireContentAccess, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ComplianceBody = {
  reviewItemId?: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_review');

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json()) as ComplianceBody;

    if (!body.reviewItemId) {
      return NextResponse.json({ error: 'reviewItemId is required' }, { status: 400 });
    }

    const { data: reviewItem, error: reviewError } = await supabase
      .from('review_items')
      .select('id, content_item_id, review_type, risk_level')
      .eq('id', body.reviewItemId)
      .single();

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    const inaccessible = await requireContentAccess(supabase, actor, reviewItem.content_item_id);

    if (inaccessible) {
      return inaccessible;
    }

    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('title')
      .eq('id', reviewItem.content_item_id)
      .single();

    if (contentError) {
      throw new Error(contentError.message);
    }

    const assessment = buildComplianceAssessment({
      riskLevel: reviewItem.risk_level,
      reviewType: reviewItem.review_type,
      contentTitle: contentItem.title,
    });

    const { data: check, error: checkError } = await supabase
      .from('compliance_checks')
      .insert({
        content_item_id: reviewItem.content_item_id,
        review_item_id: reviewItem.id,
        status: assessment.status,
        summary: assessment.summary,
        model: 'rules-scaffold-v1',
      })
      .select()
      .single();

    if (checkError) {
      throw new Error(checkError.message);
    }

    if (assessment.findings.length) {
      const { error: findingsError } = await supabase.from('compliance_findings').insert(
        assessment.findings.map((finding) => ({
          compliance_check_id: check.id,
          ...finding,
        })),
      );

      if (findingsError) {
        throw new Error(findingsError.message);
      }
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'review.compliance_checked',
      targetType: 'compliance_check',
      targetId: check.id,
      metadata: {
        reviewItemId: reviewItem.id,
        contentItemId: reviewItem.content_item_id,
        status: assessment.status,
        findings: assessment.findings.length,
      },
    });

    return NextResponse.json({ check, findings: assessment.findings });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Compliance check failed',
      source: 'review_compliance_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
