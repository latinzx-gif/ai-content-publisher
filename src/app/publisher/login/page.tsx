import { Suspense } from 'react';
import { ContentOsLoginPage } from '@/components/auth/ContentOsLoginPage';

export default function PublisherLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#f4f6fb]">
          <p className="text-sm text-[#4a4455]">Loading…</p>
        </div>
      }
    >
      <ContentOsLoginPage />
    </Suspense>
  );
}
