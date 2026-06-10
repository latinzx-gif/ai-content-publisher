import Image from "next/image";

import { Badge } from "@/components/publisher/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import type { GeneratedContentVersion } from "@/lib/publisher/content-generator";
import type { QualityCheckResult } from "@/lib/publisher/quality-checker";
import type { ReviewData } from "./ReviewDashboard";

export default function PostPreview({
  data,
  postId,
}: {
  data: ReviewData;
  postId: string;
}) {
  const primaryImage = data.images?.primary.at(-1);
  const secondaryImage = data.images?.secondary.at(-1);
  const qcResults = data.qc?.results || [];
  const primaryNotes = qcResults.filter((result) => result.status !== "pass");
  const secondaryNotes = qcResults.filter((result) => result.status !== "pass");

  if (!postId) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">Enter a post ID to load review data.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.content) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            No saved content found for {postId}. Generate and save content first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PreviewSection
        imageUrl={primaryImage?.image_url}
        isPlaceholder={primaryImage?.is_placeholder ?? false}
        notes={primaryNotes}
        title="Primary Post"
        version={data.content.primary}
      />
      <PreviewSection
        imageUrl={secondaryImage?.image_url}
        isPlaceholder={secondaryImage?.is_placeholder ?? false}
        notes={secondaryNotes}
        title="Secondary Comment"
        version={data.content.secondary}
      />
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>QC notes summary</CardTitle>
        </CardHeader>
        <CardContent>
          {qcResults.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {qcResults.map((result) => (
                <QcNote key={result.check} result={result} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No QC result saved for this post.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewSection({
  imageUrl,
  isPlaceholder,
  notes,
  title,
  version,
}: {
  imageUrl?: string;
  isPlaceholder: boolean;
  notes: QualityCheckResult[];
  title: string;
  version: GeneratedContentVersion;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl ? (
          <div className="relative aspect-[3/2] overflow-hidden rounded-[calc(var(--radius)*0.55)]">
            <Image
              alt={`${title} generated visual`}
              className="object-cover"
              fill
              sizes="(max-width: 1280px) 100vw, 50vw"
              src={imageUrl}
              unoptimized
            />
            {isPlaceholder ? (
              <Badge className="absolute left-3 top-3 bg-[var(--danger-soft)] text-[var(--danger-ink)]">
                PLACEHOLDER — image generation failed
              </Badge>
            ) : null}
          </div>
        ) : (
          <div className="flex aspect-[3/2] items-center justify-center rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] text-sm font-semibold text-[var(--text-muted)]">
            Missing image
          </div>
        )}
        <ContentLine label="Headline" value={version.headline} />
        <ContentLine label="Subheadline" value={version.subheadline} />
        <ContentLine label="Support line" value={version.support_line} />
        <ContentLine label="Long-form article" value={version.long_form} />
        <ContentLine label="Hashtags" value={version.hashtags} />
        <ContentLine label="Disclaimer" value={version.disclaimer} />
        <div className="rounded-[calc(var(--radius)*0.55)] bg-[var(--warning-panel)] p-3">
          <p className="text-sm font-black text-[var(--warning-ink)]">QC notes</p>
          {notes.length ? (
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-subtle)]">
              {notes.map((note) => (
                <li key={note.check}>{note.check}: {note.details}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">No warnings or failures.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContentLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--ink)]">{value}</p>
    </div>
  );
}

function QcNote({ result }: { result: QualityCheckResult }) {
  const className =
    result.status === "fail"
      ? "bg-[var(--danger-soft)] text-[var(--danger-ink)]"
      : result.status === "warn"
        ? "bg-[var(--warning-soft)] text-[var(--warning-ink)]"
        : result.status === "pass"
          ? "bg-[var(--success-soft)] text-[var(--success-ink)]"
          : "bg-[var(--info-soft)] text-[var(--info-ink)]";

  return (
    <div className="rounded-[calc(var(--radius)*0.55)] border border-[var(--line)] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-[var(--navy)]">{result.check}</p>
        <Badge className={className}>{result.status.toUpperCase()}</Badge>
      </div>
      <p className="mt-2 text-sm text-[var(--text-subtle)]">{result.details}</p>
    </div>
  );
}
