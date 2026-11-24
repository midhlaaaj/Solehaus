'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Plus, X } from 'lucide-react';
import { pctOff, productHref, titleOf, type Product } from '@/lib/products';
import { inr } from '@/lib/site';
import { useCart } from './cart';

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [ci, setCi] = useState(0);
  const [liked, setLiked] = useState(false);
  const [tray, setTray] = useState(false);
  const { add } = useCart();
  const color = p.colors[ci];
  const off = pctOff(p);
  const href = productHref(p, color.name);
  const own = p.brand === 'SOLEHAUS';
  const title = titleOf(p);
  const allOut = p.sizes.every((s) => p.soldOut?.includes(s));

  return (
    <article className="group/card @container flex min-w-0 flex-col" onMouseLeave={() => setTray(false)}>
      {/* ---------- image ---------- */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.06] ring-inset">
        <Link href={href} aria-label={`${title}, ${color.name}`} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={color.image}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Image
                src={color.image}
                alt={`${title} in ${color.name}`}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 72vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-[1.05]"
              />
            </motion.div>
          </AnimatePresence>
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1">
          {off > 0 && <span className="rounded-md bg-white px-2 py-[3px] text-[11px] font-bold text-ink tabular-nums">−{off}%</span>}
          {p.isNew && <span className="rounded-md bg-ink/80 px-2 py-[3px] text-[11px] font-semibold text-white backdrop-blur">New</span>}
        </div>

        {/* wishlist */}
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={liked}
          className={`absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition duration-300 hover:scale-105 focus-visible:opacity-100 ${
            liked ? 'opacity-100' : 'md:opacity-0 md:group-hover/card:opacity-100'
          }`}
        >
          <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}>
            <Heart className={`size-[17px] ${liked ? 'fill-ink' : ''}`} strokeWidth={1.8} />
          </motion.span>
        </button>

        {/* quick add */}
        {!allOut && !tray && (
          <button
            onClick={() => setTray(true)}
            aria-label={`Quick add ${title}`}
            className="group/qa absolute right-2.5 bottom-2.5 flex h-9 @[230px]:right-3 @[230px]:bottom-3 @[230px]:h-10 items-center overflow-hidden rounded-full bg-white text-ink shadow-lg shadow-black/30 transition-all duration-300"
          >
            <span className="grid size-9 shrink-0 place-items-center @[230px]:size-10">
              <Plus className="size-[18px]" strokeWidth={2.2} />
            </span>
            <span className="max-w-0 overflow-hidden pr-0 text-[13px] font-semibold whitespace-nowrap transition-all duration-300 group-hover/qa:max-w-[90px] group-hover/qa:pr-4 group-focus-visible/qa:max-w-[90px] group-focus-visible/qa:pr-4">
              Quick add
            </span>
          </button>
        )}

        <AnimatePresence>
          {tray && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-x-0 bottom-0 bg-white p-3 text-ink"
              role="dialog"
              aria-label={`Choose a size for ${title}`}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[12px] font-semibold">
                  Select size <span className="font-normal text-black/45">· {color.name}</span>
                </p>
                <button onClick={() => setTray(false)} aria-label="Close" className="grid size-7 place-items-center rounded-full hover:bg-black/5">
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1 @[230px]:grid-cols-6">
                {p.sizes.map((s) => {
                  const out = p.soldOut?.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={out}
                      title={out ? `${s} sold out` : s}
                      onClick={() => {
                        add({ handle: p.handle, name: title, color: color.name, size: s, price: p.price, image: color.image });
                        setTray(false);
                      }}
                      className="h-9 rounded-md bg-black/[0.05] text-[12px] font-semibold tabular-nums transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:bg-transparent disabled:text-black/25 disabled:line-through"
                    >
                      {s.replace(/^(EU|UK) /, '')}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {allOut && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/70 py-2 text-center text-[12px] font-semibold text-white backdrop-blur">Sold out</span>
        )}
      </div>

      {/* ---------- info ---------- */}
      <div className="mt-3.5 px-0.5">
        <div className="flex flex-col gap-1 @[230px]:flex-row @[230px]:items-start @[230px]:justify-between @[230px]:gap-3">
          <h3 className="line-clamp-2 text-[14px] leading-snug font-semibold text-white @[230px]:text-[15px]">
            <Link href={href} className="decoration-white/40 underline-offset-4 hover:underline">
              {p.name}
            </Link>
          </h3>
          <p className="flex shrink-0 items-baseline gap-1.5 text-[14px] font-semibold text-white tabular-nums @[230px]:text-[15px]">
            {p.was && <s className="text-[12px] font-normal text-white/40">{inr(p.was)}</s>}
            {inr(p.price)}
          </p>
        </div>
        <p className="mt-1 truncate text-[12px] text-white/50 @[230px]:text-[13px]">
          {own ? color.name : <>{p.brand} · {color.name}</>}
        </p>

        {p.colors.length > 1 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1" role="radiogroup" aria-label={`${p.name} colours`}>
            {p.colors.slice(0, 6).map((cl, idx) => (
              <button
                key={cl.name}
                role="radio"
                aria-checked={idx === ci}
                aria-label={cl.name}
                title={cl.name}
                onClick={() => setCi(idx)}
                onMouseEnter={() => setCi(idx)}
                className={`grid size-6 place-items-center rounded-full transition ${idx === ci ? 'ring-1 ring-white' : 'hover:ring-1 hover:ring-white/30'}`}
              >
                <span className="size-4 rounded-full ring-1 ring-white/20 ring-inset" style={{ background: cl.hex }} />
              </button>
            ))}
            {p.colors.length > 6 && <span className="ml-1 text-[12px] text-white/45">+{p.colors.length - 6}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
