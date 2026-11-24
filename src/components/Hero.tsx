'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { inr } from '@/lib/site';

/** Homepage hero: one full-bleed photo per slide, giant type, single CTA. */
type Slide = {
  img: string;
  pos: string; // desktop crop
  posMobile?: string;
  alt: string;
  title: [string, string];
  cta: string;
  href: string;
  product?: { name: string; price: number };
};

const SLIDES: Slide[] = [
  {
    img: '/hero/full-jordan.jpg', pos: '50% 62%', posMobile: '50% 40%',
    alt: 'Air Jordan 1 Retro High in red and black, mid-jump',
    title: ['Make an', 'entrance'], cta: 'Shop now', href: '/products/air-jordan-1-retro-high',
    product: { name: 'Air Jordan 1 Retro High', price: 3499 },
  },
  {
    img: '/hero/full-chunky.jpg', pos: '50% 55%',
    alt: 'Low-angle shot of chunky sneakers',
    title: ['Step into', 'class'], cta: 'Shop New Balance', href: '/shop?brand=new-balance',
    product: { name: 'New Balance 9060', price: 3650 },
  },
  {
    img: '/hero/full-runner.jpg', pos: '50% 50%',
    alt: 'Triple black runner under orange light trails',
    title: ['After', 'dark'], cta: 'Shop black sneakers', href: '/shop?colour=black',
  },
  {
    img: '/hero/full-street.jpg', pos: '50% 70%', posMobile: '50% 60%',
    alt: 'Sneakers styled with wide trousers on a city street',
    title: ['Walk your', 'own way'], cta: 'Shop all sneakers', href: '/shop',
  },
];

const D = 6500;
const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const reduce = useReducedMotion();
  const n = SLIDES.length;
  const s = SLIDES[i];
  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 639px)');
    const on = () => setMobile(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => go(i + 1), D);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [i, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[calc(100svh-108px)] min-h-[560px] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* photo */}
      <motion.div
        className="absolute inset-0 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(i + 1);
          else if (info.offset.x > 60) go(i - 1);
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={s.img}
            className="absolute inset-0"
            initial={{ clipPath: 'inset(0 0 0 100%)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.14 }}
              animate={{ scale: reduce ? 1.0 : 1.02 }}
              transition={{ duration: D / 1000 + 1.2, ease: 'easeOut' }}
            >
              <Image
                src={s.img}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={85}
                draggable={false}
                className="pointer-events-none object-cover select-none"
                style={{ objectPosition: mobile && s.posMobile ? s.posMobile : s.pos }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35" />

      {/* product tag */}
      <AnimatePresence mode="wait">
        {s.product && (
          <motion.div
            key={`tag-${i}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
            className="absolute top-5 right-4 hidden sm:block sm:top-8 sm:right-8"
          >
            <Link href={s.href} className="flex items-center gap-3 rounded-full border border-white/20 bg-black/40 py-2 pr-2 pl-5 text-[13px] text-white backdrop-blur-md transition hover:bg-black/60">
              <span className="font-semibold">{s.product.name}</span>
              <span className="text-white/65">{inr(s.product.price)}</span>
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink"><ArrowRight className="size-4" /></span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* copy */}
      <div className="pointer-events-none relative flex h-full flex-col items-center justify-end px-4 pb-10 text-center sm:pb-14">
        <AnimatePresence mode="wait">
          <motion.h1
            key={`h-${i}`}
            className="font-wide text-[clamp(34px,9.6vw,176px)] leading-[0.86] font-extrabold tracking-[-0.02em] text-white uppercase"
            initial="h"
            animate="s"
            exit="o"
          >
            {s.title.map((t, li) => (
              <span key={li} className="block overflow-hidden">
                <motion.span className="block" variants={{ h: { y: '100%' }, s: { y: 0 }, o: { y: '-100%' } }} transition={{ duration: 0.8, delay: 0.25 + li * 0.08, ease: EASE }}>
                  {t}
                </motion.span>
              </span>
            ))}
          </motion.h1>
        </AnimatePresence>

        <motion.div key={`c-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5, ease: EASE }} className="pointer-events-auto mt-6 flex sm:mt-8 flex-col items-center gap-3">
          <Link href={s.href} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold text-ink transition hover:bg-white/90 sm:h-14 sm:px-8 sm:text-[15px]">
            {s.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
          {s.product && <p className="text-[13px] text-white/70 sm:hidden">{s.product.name} · {inr(s.product.price)}</p>}
        </motion.div>

        <div className="pointer-events-auto mt-6 flex w-full max-w-[240px] sm:mt-9 sm:max-w-[280px] gap-2">
          {SLIDES.map((sl, idx) => (
            <button key={sl.img} onClick={() => go(idx)} aria-label={`Slide ${idx + 1}: ${sl.title.join(' ')}`} aria-current={idx === i} className="group h-6 flex-1">
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/25 transition group-hover:bg-white/45">
                {idx < i && <span className="block h-full bg-white/70" />}
                {idx === i &&
                  (paused || reduce ? (
                    <span className="block h-full bg-white" />
                  ) : (
                    <motion.span key={`p-${i}`} className="block h-full origin-left bg-white" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: D / 1000, ease: 'linear' }} />
                  ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
