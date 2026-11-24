import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES, byCat } from '@/lib/products';
import Reveal, { SectionHead } from './Reveal';

/**
 * Layout for ANY number of categories, with no holes:
 *  mobile (2 cols): first tile full width; if the rest is odd, the last one is full width too.
 *  desktop (4 cols): >=5 tiles -> first is a 2x2 feature, last row stretches; <5 -> equal columns.
 */
function layout(total: number) {
  return Array.from({ length: total }, (_, i) => {
    const cls: string[] = [];
    let wide = false;
    // mobile
    if (i === 0 && total > 2) { cls.push('col-span-2'); wide = true; }
    const rest = total > 2 ? total - 1 : total;
    if (i === total - 1 && i !== 0 && rest % 2 === 1) { cls.push('col-span-2'); wide = true; }
    // desktop
    if (total >= 5) {
      cls.push(i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1');
      const r = total - 5, m = r % 4, k = i - 5;
      if (k >= 0 && m && k >= r - m) cls.push(m === 1 ? 'md:col-span-4' : m === 2 || k === r - 1 ? 'md:col-span-2' : '');
    } else cls.push('md:col-span-1');
    return { cls: cls.join(' '), wide, feature: i === 0 && total >= 5 };
  });
}

const COLS = ['md:grid-cols-1', 'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4'];

export default function Categories() {
  const lay = layout(CATEGORIES.length);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <SectionHead title="Shop by category" />
      <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 md:auto-rows-[260px] md:gap-4 lg:auto-rows-[300px] ${COLS[Math.min(CATEGORIES.length, 4)]}`}>
        {CATEGORIES.map((c, i) => {
          const n = byCat(c.slug).length;
          const { cls, wide, feature } = lay[i];
          return (
            <Reveal key={c.slug} delay={i * 0.05} y={18} className={cls}>
              <Link
                href={c.soon ? '#' : `/shop/${c.slug}`}
                aria-disabled={c.soon}
                className={`group relative block h-full overflow-hidden rounded-lg bg-surface sm:rounded-xl md:aspect-auto ${wide ? 'aspect-[16/10]' : 'aspect-square'}`}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes={feature ? '(min-width: 768px) 50vw, 100vw' : wide ? '100vw' : '(min-width: 768px) 25vw, 50vw'}
                  className={`object-cover transition duration-700 ease-out group-hover:scale-105 ${c.soon ? 'grayscale' : ''}`}
                  style={{ objectPosition: c.position }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                <div className="absolute inset-x-3.5 bottom-3.5 flex items-end justify-between gap-2 sm:inset-x-6 sm:bottom-6">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white/70 sm:text-[13px]">{c.soon ? 'Coming soon' : `${n} ${n === 1 ? 'style' : 'styles'}`}</p>
                    <h3
                      className={`mt-0.5 font-wide leading-none font-extrabold text-white uppercase ${
                        feature ? 'text-[22px] sm:text-[clamp(32px,4.4vw,64px)]' : 'text-[15px] sm:text-[clamp(20px,2vw,30px)]'
                      }`}
                    >
                      {c.name}
                    </h3>
                  </div>
                  {!c.soon && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ink transition duration-300 group-hover:rotate-45 sm:size-11">
                      <ArrowUpRight className="size-4 sm:size-5" />
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
