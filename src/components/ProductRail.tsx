'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';

/** Horizontal, snap-scrolling product row with arrow controls + progress line. */
export default function ProductRail({ items }: { items: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProg(max > 0 ? el.scrollLeft / max : 1);
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  };
  useEffect(update, [items]);

  const page = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.9, behavior: 'smooth' });
  const scrollable = items.length > 4;

  return (
    <div>
      <div
        ref={ref}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, i) => (
          <div key={p.handle} className="w-[60%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[calc((100%-48px)/4)]">
            <ProductCard p={p} priority={i < 2} />
          </div>
        ))}
      </div>
      {scrollable && (
        <div className="mt-7 flex items-center gap-5">
          <div className="h-px flex-1 bg-white/12">
            <div className="h-px bg-white transition-[width] duration-200" style={{ width: `${Math.max(12, prog * 100)}%` }} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => page(-1)}
              disabled={edge.start}
              aria-label="Scroll left"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => page(1)}
              disabled={edge.end}
              aria-label="Scroll right"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
