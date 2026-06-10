'use client';

import { Suspense } from 'react';
import { PrdPageLoadingFallback } from '@/features/prd/components/PrdPageLoadingFallback';
import { PrdPageClient } from '@/features/prd/PrdPageClient';

export default function PrdPage() {
  return (
    <Suspense fallback={<PrdPageLoadingFallback />}>
      <PrdPageClient />
    </Suspense>
  );
}
