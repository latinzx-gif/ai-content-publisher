import { Files } from "lucide-react";

import { Badge } from "@/components/publisher/ui/badge";
import { Card, CardContent } from "@/components/publisher/ui/card";

export default function SourcesPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <CardContent className="space-y-4 p-8">
          <Badge className="bg-[var(--gold-soft)] text-[var(--gold-ink)]">Phase 2</Badge>
          <Files className="mx-auto size-10 text-[var(--gold)]" aria-hidden />
          <h1 className="text-3xl font-black text-[var(--navy)]">Sources</h1>
          <p className="text-[var(--text-muted)]">Coming in Phase 2: source intake, citations, and evidence review workflows.</p>
        </CardContent>
      </Card>
    </section>
  );
}
