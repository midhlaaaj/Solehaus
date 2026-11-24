import type { Metadata } from 'next';
import { Suspense } from 'react';
import CartView from '@/components/CartView';

export const metadata: Metadata = { title: 'Your bag — SOLEHAUS' };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70svh]" />}>
      <CartView />
    </Suspense>
  );
}
