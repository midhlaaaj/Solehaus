import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CATEGORIES, catInfo } from '@/lib/products';
import Listing from '@/components/shop/Listing';

type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = catInfo((await params).category);
  return { title: c ? `${c.name} — SOLEHAUS` : 'Not found — SOLEHAUS' };
}

async function Category({ params }: { params: Params }) {
  const c = catInfo((await params).category);
  if (!c) notFound();
  return <Listing cat={c.slug} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" />}>
      <Category params={params} />
    </Suspense>
  );
}
