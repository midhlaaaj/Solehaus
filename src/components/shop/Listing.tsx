'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, PRODUCTS, catInfo, pctOff, searchProducts, type Category, type Product } from '@/lib/products';
import { waLink } from '@/lib/site';
import ProductCard from '../ProductCard';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'best', label: 'Bestselling' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

const PRICES = [
  { id: 'u2', label: 'Under ₹2,000', test: (n: number) => n < 2000 },
  { id: '2to3', label: '₹2,000 – ₹3,000', test: (n: number) => n >= 2000 && n <= 3000 },
  { id: 'o3', label: 'Over ₹3,000', test: (n: number) => n > 3000 },
];

type Filters = { brands: string[]; sizes: string[]; price: string | null; sale: boolean };
const EMPTY: Filters = { brands: [], sizes: [], price: null, sale: false };

function sortItems(items: Product[], sort: SortId) {
  const a = [...items];
  if (sort === 'best') return a.sort((x, y) => Number(!!y.best) - Number(!!x.best));
  if (sort === 'new') return a.sort((x, y) => Number(!!y.isNew) - Number(!!x.isNew));
  if (sort === 'price-asc') return a.sort((x, y) => x.price - y.price);
  if (sort === 'price-desc') return a.sort((x, y) => y.price - x.price);
  return a;
}

function FilterPanel({ base, f, setF }: { base: Product[]; f: Filters; setF: (f: Filters) => void }) {
  const brands = [...new Set(base.map((p) => p.brand))];
  const sizes = [...new Set(base.flatMap((p) => p.sizes))];
  const toggle = (k: 'brands' | 'sizes', v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const count = (fn: (p: Product) => boolean) => base.filter(fn).length;
  return (
    <div className="space-y-7">
      {brands.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold tracking-[0.12em] text-white/45 uppercase">Brand</legend>
          <div className="space-y-1">
            {brands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1.5 text-[14px] text-white/80 hover:text-white">
                <span className="flex items-center gap-3">
                  <input type="checkbox" checked={f.brands.includes(b)} onChange={() => toggle('brands', b)} className="size-4 accent-white" />
                  {b}
                </span>
                <span className="text-[12px] text-white/35">{count((p) => p.brand === b)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-3 text-[12px] font-semibold tracking-[0.12em] text-white/45 uppercase">Size</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {sizes.map((s) => {
            const on = f.sizes.includes(s);
            return (
              <button key={s} onClick={() => toggle('sizes', s)} aria-pressed={on} className={`h-10 rounded-lg border text-[13px] font-semibold tabular-nums transition ${on ? 'border-white bg-white text-ink' : 'border-white/15 text-white/80 hover:border-white/40'}`}>
                {s.replace(/^EU /, '')}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-[12px] font-semibold tracking-[0.12em] text-white/45 uppercase">Price</legend>
        <div className="space-y-1">
          {PRICES.map((pr) => (
            <label key={pr.id} className="flex cursor-pointer items-center justify-between px-1 py-1.5 text-[14px] text-white/80 hover:text-white">
              <span className="flex items-center gap-3">
                <input type="radio" name="price" checked={f.price === pr.id} onChange={() => setF({ ...f, price: f.price === pr.id ? null : pr.id })} onClick={() => f.price === pr.id && setF({ ...f, price: null })} className="size-4 accent-white" />
                {pr.label}
              </span>
              <span className="text-[12px] text-white/35">{count((p) => pr.test(p.price))}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center justify-between px-1 text-[14px] text-white/80">
        On sale only
        <button role="switch" aria-checked={f.sale} onClick={() => setF({ ...f, sale: !f.sale })} className={`relative h-6 w-11 rounded-full transition ${f.sale ? 'bg-white' : 'bg-white/15'}`}>
          <span className={`absolute top-1 size-4 rounded-full transition-all ${f.sale ? 'left-6 bg-ink' : 'left-1 bg-white'}`} />
        </button>
      </label>
    </div>
  );
}

/** Remounts the listing when the category or search changes, so filters start clean. */
export default function Listing({ cat }: { cat?: Category }) {
  const params = useSearchParams();
  const q = cat ? '' : (params.get('q') ?? '').trim();
  return <ListingBody key={`${cat ?? 'all'}|${q}`} cat={cat} q={q} initialSort={(params.get('sort') as SortId) || 'featured'} />;
}

function ListingBody({ cat, q, initialSort }: { cat?: Category; q: string; initialSort: SortId }) {
  const router = useRouter();
  const [sort, setSort] = useState<SortId>(initialSort);
  const [f, setF] = useState<Filters>(EMPTY);
  const [drawer, setDrawer] = useState(false);
  const info = cat ? catInfo(cat) : undefined;

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? 'hidden' : '';
  }, [drawer]);

  const base = useMemo(() => (cat ? PRODUCTS.filter((p) => p.cat === cat) : q ? searchProducts(q) : PRODUCTS), [cat, q]);
  const items = useMemo(() => {
    const out = base.filter(
      (p) =>
        (!f.brands.length || f.brands.includes(p.brand)) &&
        (!f.sizes.length || f.sizes.some((s) => p.sizes.includes(s) && !p.soldOut?.includes(s))) &&
        (!f.price || PRICES.find((x) => x.id === f.price)!.test(p.price)) &&
        (!f.sale || pctOff(p) > 0),
    );
    return q && sort === 'featured' ? out : sortItems(out, sort);
  }, [base, f, sort, q]);

  const active = f.brands.length + f.sizes.length + (f.price ? 1 : 0) + (f.sale ? 1 : 0);
  const title = info ? info.name : q ? `“${q}”` : 'Shop all';

  if (info?.soon) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <Crumbs title={info.name} />
        <div className="relative mt-2 overflow-hidden rounded-xl bg-surface">
          <Image src={info.image} alt="" fill sizes="100vw" className="object-cover opacity-40 grayscale" />
          <div className="relative flex min-h-[60svh] flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-[13px] font-semibold tracking-[0.14em] text-white/60 uppercase">Coming soon</p>
            <h1 className="mt-3 font-wide text-[clamp(36px,7vw,88px)] leading-none font-extrabold text-white uppercase">{info.name}</h1>
            <p className="mt-4 max-w-md text-[15px] text-white/70">We’re lining up the first drop. Get a message the day it lands.</p>
            <a href={waLink(`Hi! Please notify me when ${info.name.toLowerCase()} are available.`)} target="_blank" rel="noopener" className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-7 text-[14px] font-bold text-ink">
              Notify me on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
      <Crumbs title={info?.name ?? (q ? 'Search' : 'Shop all')} />

      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        {q && <p className="text-[13px] text-white/50">Search results for</p>}
        <h1 className="font-wide text-[clamp(28px,4.4vw,60px)] leading-none font-extrabold text-white uppercase">{title}</h1>
        <p className="mt-2 text-[13px] text-white/50">{items.length} {items.length === 1 ? 'product' : 'products'}</p>
      </div>

      {/* category chips */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <Chip href="/shop" on={!cat && !q}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} href={`/shop/${c.slug}`} on={cat === c.slug}>
            {c.name}
            {c.soon && <span className="ml-1.5 text-[10px] opacity-60">SOON</span>}
          </Chip>
        ))}
      </div>

      {/* toolbar */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-y border-white/10 bg-ink/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:px-3 lg:top-16">
        <button onClick={() => setDrawer(true)} className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] font-semibold text-white lg:hidden">
          <SlidersHorizontal className="size-4" /> Filters {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-white text-[11px] text-ink">{active}</span>}
        </button>
        <p className="hidden pl-2 text-[13px] text-white/50 lg:block">
          {active > 0 ? `${active} filter${active > 1 ? 's' : ''} applied` : 'Refine with filters on the left'}
        </p>
        <label className="relative flex items-center gap-2 text-[13px] text-white/60">
          <span className="hidden sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="h-10 appearance-none rounded-full border border-white/15 bg-ink pr-9 pl-4 text-[13px] font-semibold text-white outline-none focus:border-white">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4 text-white/60" />
        </label>
      </div>

      {active > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {f.brands.map((b) => <ActiveChip key={b} onClick={() => setF({ ...f, brands: f.brands.filter((x) => x !== b) })}>{b}</ActiveChip>)}
          {f.sizes.map((s) => <ActiveChip key={s} onClick={() => setF({ ...f, sizes: f.sizes.filter((x) => x !== s) })}>{s}</ActiveChip>)}
          {f.price && <ActiveChip onClick={() => setF({ ...f, price: null })}>{PRICES.find((p) => p.id === f.price)!.label}</ActiveChip>}
          {f.sale && <ActiveChip onClick={() => setF({ ...f, sale: false })}>On sale</ActiveChip>}
          <button onClick={() => setF(EMPTY)} className="px-2 text-[13px] text-white/60 underline underline-offset-4 hover:text-white">Clear all</button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36"><FilterPanel base={base} f={f} setF={setF} /></div>
        </aside>

        {items.length ? (
          <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 md:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => (
                <motion.div key={p.handle} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}>
                  <ProductCard p={p} priority={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-white/10 px-6 py-20 text-center">
            <p className="text-lg font-semibold text-white">{q && !base.length ? `No results for “${q}”` : 'No products match these filters'}</p>
            <p className="mt-2 max-w-sm text-[14px] text-white/55">{q && !base.length ? 'Try a brand like Nike or New Balance, or a model like Dunk or 9060.' : 'Try removing a filter or two.'}</p>
            <div className="mt-6 flex gap-2">
              {active > 0 && <button onClick={() => setF(EMPTY)} className="h-11 rounded-full bg-white px-6 text-[14px] font-bold text-ink">Clear filters</button>}
              {q && <button onClick={() => router.push('/shop')} className="h-11 rounded-full border border-white/20 px-6 text-[14px] font-semibold text-white">Browse everything</button>}
            </div>
          </div>
        )}
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
            <motion.div
              role="dialog"
              aria-label="Filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-xl bg-surface"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="text-[16px] font-bold text-white">Filters</p>
                <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><X className="size-5 text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5"><FilterPanel base={base} f={f} setF={setF} /></div>
              <div className="flex gap-2 border-t border-white/10 px-5 py-4">
                <button onClick={() => setF(EMPTY)} className="h-12 flex-1 rounded-full border border-white/20 text-[14px] font-semibold text-white">Clear</button>
                <button onClick={() => setDrawer(false)} className="h-12 flex-[2] rounded-full bg-white text-[14px] font-bold text-ink">Show {items.length} products</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Crumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-4 text-[12px] text-white/50 sm:text-[13px]">
      <Link href="/" className="hover:text-white">Home</Link>
      <ChevronRight className="size-3.5" />
      <span className="text-white/80">{title}</span>
    </nav>
  );
}

function Chip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold transition ${on ? 'bg-white text-ink' : 'border border-white/15 text-white/75 hover:border-white/40 hover:text-white'}`}>
      {children}
    </Link>
  );
}

function ActiveChip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex h-8 items-center gap-1.5 rounded-full bg-white/10 pr-2.5 pl-3.5 text-[12px] font-semibold text-white hover:bg-white/15">
      {children} <X className="size-3.5" />
    </button>
  );
}
