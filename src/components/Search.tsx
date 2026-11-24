'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Clock, Search as SearchIcon, TrendingUp, X } from 'lucide-react';
import { BRANDS, CATEGORIES, bestsellers, searchProducts, titleOf, type Product } from '@/lib/products';
import { inr } from '@/lib/site';

const RECENT = 'solehaus-recent-searches';
const TRENDING = ['Dunk Low', 'Jordan 1', 'New Balance 9060', 'Mexico 66', 'P-6000', 'Crocs'];
const EASE = [0.2, 0.7, 0.2, 1] as const;

type Row = { kind: 'product'; p: Product } | { kind: 'link'; label: string; href: string; sub?: string } | { kind: 'query'; q: string };

function Mark({ text, q }: { text: string; q: string }) {
  const t = q.trim();
  if (!t) return <>{text}</>;
  const i = text.toLowerCase().indexOf(t.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-white underline decoration-white/40 underline-offset-2">{text.slice(i, i + t.length)}</mark>
      {text.slice(i + t.length)}
    </>
  );
}

const loadRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT) || '[]');
  } catch {
    return [];
  }
};

/** Mounted only while open: every opening starts with an empty query and fresh recent searches. */
export default function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <AnimatePresence>{open && <Panel onClose={onClose} />}</AnimatePresence>;
}

function Panel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(-1);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => input.current?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = '';
    };
  }, []);

  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);
  const linkMatches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return [
      ...CATEGORIES.filter((c) => c.name.toLowerCase().includes(t)).map((c) => ({ kind: 'link' as const, label: c.name, href: `/shop/${c.slug}`, sub: c.soon ? 'Coming soon' : 'Category' })),
      ...BRANDS.filter((b) => b !== 'SOLEHAUS' && b.toLowerCase().includes(t)).map((b) => ({ kind: 'link' as const, label: b, href: `/shop?q=${encodeURIComponent(b)}`, sub: 'Brand' })),
    ].slice(0, 4);
  }, [q]);

  // keyboard-navigable rows, in visual order
  const rows: Row[] = useMemo(
    () => (q.trim() ? [...linkMatches, ...results.map((p) => ({ kind: 'product' as const, p })), { kind: 'query' as const, q: q.trim() }] : []),
    [q, linkMatches, results],
  );

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT, JSON.stringify(next)); } catch {}
  };
  const go = (href: string, term?: string) => {
    if (term) remember(term);
    onClose();
    router.push(href);
  };
  const choose = (r: Row) => {
    if (r.kind === 'product') go(`/products/${r.p.handle}`, q.trim() || undefined);
    else if (r.kind === 'link') go(r.href, r.label);
    else go(`/shop?q=${encodeURIComponent(r.q)}`, r.q);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose();
    if (!rows.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % rows.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h <= 0 ? rows.length - 1 : h - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); choose(rows[hi >= 0 ? hi : rows.length - 1]); }
  };
  const idx = (r: Row) => rows.indexOf(r);

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem(RECENT); } catch {}
  };

  const Idle = (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] [&>*]:min-w-0">
      <div className="space-y-7">
        {recent.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Recent</p>
              <button onClick={clearRecent} className="text-[12px] text-white/45 hover:text-white">Clear</button>
            </div>
            <ul className="space-y-0.5">
              {recent.map((r) => (
                <li key={r}>
                  <button onClick={() => go(`/shop?q=${encodeURIComponent(r)}`, r)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] text-white/80 hover:bg-white/5 hover:text-white">
                    <Clock className="size-4 text-white/40" /> {r}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <button key={t} onClick={() => go(`/shop?q=${encodeURIComponent(t)}`, t)} className="flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-[13px] text-white transition hover:border-white hover:bg-white hover:text-ink">
                <TrendingUp className="size-3.5" /> {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.slug} onClick={() => go(`/shop/${c.slug}`)} className="group relative h-16 overflow-hidden rounded-xl text-left">
                <Image src={c.image} alt="" fill sizes="160px" className={`object-cover transition duration-500 group-hover:scale-110 ${c.soon ? 'grayscale' : ''}`} />
                <span className="absolute inset-0 bg-black/50" />
                <span className="relative flex h-full items-end p-2.5 text-[13px] font-bold text-white">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Popular right now</p>
        <div className="grid grid-cols-3 gap-3">
          {bestsellers().slice(0, 6).map((p) => (
            <button key={p.handle} onClick={() => go(`/products/${p.handle}`)} className="group text-left">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5">
                <Image src={p.colors[0].image} alt="" fill sizes="180px" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-2 truncate text-[13px] font-semibold text-white">{titleOf(p)}</p>
              <p className="text-[12px] text-white/55">{inr(p.price)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Results = (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-8 [&>*]:min-w-0">
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">Suggestions</p>
        <ul className="space-y-0.5">
          {linkMatches.map((r) => (
            <li key={r.href}>
              <button onMouseEnter={() => setHi(idx(r))} onClick={() => choose(r)} className={`flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-[14px] ${hi === idx(r) ? 'bg-white/10 text-white' : 'text-white/80'}`}>
                <span><Mark text={r.label} q={q} /> <span className="ml-1 text-[12px] text-white/40">{r.sub}</span></span>
                <ArrowUpRight className="size-4 text-white/40" />
              </button>
            </li>
          ))}
          {rows.filter((r): r is Extract<Row, { kind: 'query' }> => r.kind === 'query').map((r) => (
            <li key="q">
              <button onMouseEnter={() => setHi(idx(r))} onClick={() => choose(r)} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[14px] ${hi === idx(r) ? 'bg-white/10 text-white' : 'text-white/80'}`}>
                <SearchIcon className="size-4 text-white/40" /> See all results for “<span className="font-semibold text-white">{r.q}</span>”
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
          Products {results.length > 0 && <span className="text-white/30">· {searchProducts(q).length}</span>}
        </p>
        {results.length ? (
          <ul className="space-y-1">
            {results.map((p) => {
              const r = rows.find((x) => x.kind === 'product' && x.p.handle === p.handle)!;
              return (
                <li key={p.handle}>
                  <button onMouseEnter={() => setHi(idx(r))} onClick={() => choose(r)} className={`flex w-full items-center gap-3.5 rounded-xl p-2 text-left transition ${hi === idx(r) ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/5"><Image src={p.colors[0].image} alt="" fill sizes="56px" className="object-cover" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-white/90"><Mark text={titleOf(p)} q={q} /></span>
                      <span className="block truncate text-[12px] text-white/50">{p.colors.length} colour{p.colors.length > 1 ? 's' : ''} · {p.colors.map((c) => c.name).slice(0, 3).join(', ')}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-semibold text-white tabular-nums">{inr(p.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-white/10 px-4 py-8 text-center">
            <p className="text-[14px] font-semibold text-white">No products match “{q.trim()}”</p>
            <p className="mt-1 text-[13px] text-white/50">Try a brand or model, like Dunk, 9060 or Mexico 66.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative flex h-[100svh] flex-col bg-ink md:h-auto md:max-h-[86svh] md:border-b md:border-white/10"
          >
            {/* input row */}
            <div className="border-b border-white/10">
              <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-3 sm:px-6 md:h-20">
                <button onClick={onClose} aria-label="Close search" className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10 md:hidden">
                  <ArrowLeft className="size-5" />
                </button>
                <SearchIcon className="hidden size-6 text-white/50 md:block" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setHi(-1); }}
                  onKeyDown={onKey}
                  placeholder="Search sneakers, brands, colours"
                  aria-label="Search products"
                  role="combobox"
                  aria-expanded={rows.length > 0}
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/35 focus-visible:outline-none md:text-2xl"
                />
                {q && (
                  <button onClick={() => { setQ(''); input.current?.focus(); }} aria-label="Clear" className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                    <X className="size-4" />
                  </button>
                )}
                <button onClick={onClose} className="hidden h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/70 hover:text-white md:flex">
                  Close <kbd className="rounded bg-white/10 px-1.5 text-[11px]">Esc</kbd>
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-8">{q.trim() ? Results : Idle}</div>
            </div>
            <div className="hidden border-t border-white/10 md:block">
              <p className="mx-auto max-w-[1400px] px-6 py-3 text-[12px] text-white/40">
                <kbd className="rounded bg-white/10 px-1.5">↑</kbd> <kbd className="rounded bg-white/10 px-1.5">↓</kbd> to move · <kbd className="rounded bg-white/10 px-1.5">Enter</kbd> to open · <kbd className="rounded bg-white/10 px-1.5">/</kbd> or <kbd className="rounded bg-white/10 px-1.5">Ctrl K</kbd> to search anywhere
              </p>
            </div>
          </motion.div>
        </motion.div>
  );
}
