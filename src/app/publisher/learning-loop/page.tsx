import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/publisher/ui/badge";
import { Card, CardContent } from "@/components/publisher/ui/card";

export default function LearningLoopPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <CardContent className="space-y-4 p-8">
          <Badge className="bg-[var(--blue-soft)] text-[var(--blue-ink)]">Phase 3</Badge>
          <RefreshCw className="mx-auto size-10 text-[var(--blue-ink)]" aria-hidden />
          <h1 className="text-3xl font-black text-[var(--navy)]">Learning Loop</h1>
          <p className="text-[var(--text-muted)]">Coming in Phase 3: feedback signals, performance learning, and optimization loops.</p>
        </CardContent>
      </Card>
    </section>
  );
}
