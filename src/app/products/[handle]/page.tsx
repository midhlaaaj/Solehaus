import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProduct, titleOf } from '@/lib/products';
import { inr } from '@/lib/site';
import ProductDetail from '@/components/pdp/ProductDetail';

type Params = Promise<{ handle: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).handle);
  if (!p) return { title: 'Not found — SOLEHAUS' };
  return { title: `${titleOf(p)} — ${inr(p.price)} | SOLEHAUS`, description: `${titleOf(p)} in ${p.colors.map((c) => c.name).join(', ')}. Cash on delivery, branded box.` };
}

async function Detail({ params }: { params: Params }) {
  const p = getProduct((await params).handle);
  if (!p) notFound();
  return <ProductDetail p={p} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="mx-auto h-[80svh] max-w-[1400px] px-4 sm:px-6" />}>
      <Detail params={params} />
    </Suspense>
  );
}
