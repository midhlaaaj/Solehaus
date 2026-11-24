'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CATEGORIES } from '@/lib/products';
import { SITE } from '@/lib/site';
import Reveal from './Reveal';

export function ShopAllBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <div ref={ref} className="relative grid overflow-hidden rounded-xl bg-surface md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[560px]">
          <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
            <Image src="/banner/shop-all.jpg" alt="Sneakers styled with wide trousers on a city street" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </div>
        <Reveal className="flex flex-col justify-center gap-4 p-6 sm:gap-6 sm:p-12 lg:p-16">
          <h2 className="font-wide text-[clamp(28px,5vw,72px)] leading-[0.95] font-extrabold text-white uppercase">Shop all</h2>
          <p className="max-w-sm text-[15px] text-white/65 italic sm:text-lg">Step into confidence. Step into class.</p>
          <ul className="space-y-2 text-[13px] text-white/70 sm:text-[15px]">
            {['EU 40–45 in most styles', 'Cash on delivery, pay when it arrives', 'Branded box with a safety box'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Check className="size-4 text-white" /> {t}
              </li>
            ))}
          </ul>
          <Link href="/shop" className="group mt-2 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold sm:h-14 sm:px-8 sm:text-[15px] text-ink transition hover:bg-white/90">
            Shop <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="border-t border-white/10">
      <Reveal className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:py-20">
        <div>
          <h2 className="font-wide text-[clamp(22px,3.6vw,48px)] leading-none font-extrabold text-white uppercase">Subscribe</h2>
          <p className="mt-2 text-[13px] text-white/55 sm:mt-3 sm:text-[15px]">Be the first to know about new drops and restocks.</p>
        </div>
        {done ? (
          <p className="flex h-14 items-center gap-2 text-white">
            <Check className="size-5" /> You’re on the list.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="flex w-full max-w-md gap-2"
          >
            <label htmlFor="nl-email" className="sr-only">Email</label>
            <input
              id="nl-email"
              type="email"
              required
              placeholder="Email address"
              className="h-12 min-w-0 flex-1 rounded-full text-[14px] sm:h-14 sm:text-base border border-white/15 bg-transparent px-6 text-white outline-none placeholder:text-white/35 focus:border-white"
            />
            <button className="h-12 shrink-0 rounded-full bg-white px-5 text-[14px] font-bold sm:h-14 sm:px-7 sm:text-base text-ink transition hover:bg-white/90">Subscribe</button>
          </form>
        )}
      </Reveal>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: 'Shop', links: [{ l: 'Shop all', href: '/shop' }, ...CATEGORIES.map((c) => ({ l: c.name, href: `/shop/${c.slug}` }))] },
    { h: 'Help', links: [{ l: 'Shipping & delivery', href: '/policies#shipping' }, { l: 'Returns & exchanges', href: '/policies#returns' }, { l: 'Size guide', href: '/size-guide' }, { l: 'Contact us', href: '/contact' }] },
    { h: 'Company', links: [{ l: 'Our policy', href: '/policies' }, { l: 'Instagram', href: SITE.instagram }] },
  ];
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-12 md:py-14">
        <div className="col-span-2 md:col-span-1">
          <p className="font-wide text-lg font-extrabold sm:text-xl tracking-[0.14em] text-white">{SITE.name}</p>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/50">
            Sneakers, boots, sandals and clogs. Shipped across India in a branded box, with cash on delivery.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <p className="mb-4 text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">{c.h}</p>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.l}>
                  <Link href={l.href} className="text-[14px] text-white/75 transition hover:text-white">{l.l}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 border-t border-white/10 px-4 py-6 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 {SITE.name}</p>
        <p>Cash on delivery · UPI · Cards</p>
      </div>
    </footer>
  );
}
