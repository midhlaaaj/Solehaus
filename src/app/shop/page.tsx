import type { Metadata } from 'next';
import { Suspense } from 'react';
import Listing from '@/components/shop/Listing';

export const metadata: Metadata = { title: 'Shop all sneakers — SOLEHAUS' };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" />}>
      <Listing />
    </Suspense>
  );
}
