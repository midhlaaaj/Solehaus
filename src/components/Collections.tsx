'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES, byCat, byCatFresh, bestsellers, type Category } from '@/lib/products';
import ProductRail from './ProductRail';
import ProductCard from './ProductCard';
import { SectionHead } from './Reveal';

export function Bestsellers() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-9 sm:px-6 sm:py-11 lg:py-14">
      <SectionHead
        title="Bestsellers"
        sub="The pairs our customers reorder most."
        action={<ViewAll href="/shop?sort=best" />}
      />
      <ProductRail items={bestsellers()} />
    </section>
  );
}

// tabs come from CATEGORIES; 'coming soon' or empty categories get no tab
const TABS = CATEGORIES.filter((c) => !c.soon && byCat(c.slug).length > 0).map((c) => ({ slug: c.slug, label: c.name }));

/** One tabbed section replaces four near-identical category rows. */
export function ShopByCollection() {
  const [tab, setTab] = useState<Category>(TABS[0]?.slug ?? 'sneakers');
  const items = byCatFresh(tab);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-9 sm:px-6 sm:py-11 lg:py-14">
      <SectionHead title="Shop the collection" action={<ViewAll href={`/shop/${tab}`} label={`All ${tab}`} />} />
      <div role="tablist" aria-label="Category" className="-mx-4 mb-6 flex gap-2 sm:mb-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.slug}
            role="tab"
            aria-selected={tab === t.slug}
            onClick={() => setTab(t.slug)}
            className={`relative h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold sm:h-11 sm:px-5 sm:text-[14px] transition ${
              tab === t.slug ? 'text-ink' : 'border border-white/15 text-white/75 hover:border-white/40 hover:text-white'
            }`}
          >
            {tab === t.slug && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
            <span className="relative">
              {t.label} <span className={tab === t.slug ? 'text-ink/50' : 'text-white/35'}>{byCat(t.slug).length}</span>
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
          {/* phones: 2-col grid (not another swipe row) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:hidden">
            {items.slice(0, 4).map((p) => (
              <ProductCard key={p.handle} p={p} />
            ))}
          </div>
          <Link
            href={`/shop/${tab}`}
            className="mt-8 flex h-12 items-center justify-center rounded-full border border-white/20 text-[14px] font-semibold text-white md:hidden"
          >
            View all {items.length} {tab}
          </Link>
          <div className="hidden md:block">
            <ProductRail items={items} />
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ViewAll({ href, label = 'View all' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="group hidden shrink-0 items-center gap-2 border-b border-white/25 pb-1 text-[14px] font-semibold text-white capitalize transition hover:border-white sm:flex">
      {label} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
    </Link>
  );
}
