import { FileSearch } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/publisher/ui/card";

export function PostIdEmptyState() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <CardContent className="space-y-4 p-8">
          <FileSearch
            className="mx-auto size-10 text-[var(--navy)]"
            aria-hidden
          />
          <CardTitle>No Post Selected</CardTitle>
          <CardDescription>
            Pass a post_id parameter in the URL (e.g. ?post_id=xxx) to load
            the content for review.
          </CardDescription>
        </CardContent>
      </Card>
    </section>
  );
}
