'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search as SearchIcon, ShoppingBag, User, X } from 'lucide-react';
import { ANNOUNCEMENTS, SITE } from '@/lib/site';
import { CATEGORIES } from '@/lib/products';
import { useCart } from './cart';
import Search from './Search';

const NAV: { label: string; href: string; soon?: boolean }[] = [
  { label: 'Shop all', href: '/shop' },
  ...CATEGORIES.map((c) => ({ label: c.name, href: `/shop/${c.slug}`, soon: c.soon })),
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ANNOUNCEMENTS.length), 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-9 overflow-hidden border-b border-white/10 bg-white text-ink">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={i}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold tracking-[0.08em] uppercase"
        >
          {ANNOUNCEMENTS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.nav
        aria-label="Mobile"
        className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col bg-ink px-6 pt-5 pb-8"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="flex items-center justify-between">
          <span className="font-wide text-lg font-extrabold tracking-[0.12em] text-white">{SITE.name}</span>
          <button onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
            <X className="size-6 text-white" />
          </button>
        </div>
        <ul className="mt-10 space-y-1">
          {NAV.map((n, idx) => (
            <motion.li key={n.label} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 + idx * 0.04 }}>
              <Link href={n.href} onClick={onClose} className="flex items-center justify-between py-3 font-semiwide text-2xl font-bold text-white">
                {n.label}
                {n.soon && <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white/60 uppercase">Soon</span>}
              </Link>
            </motion.li>
          ))}
        </ul>
        <div className="mt-auto space-y-3">
          <Link href="/account" className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 font-semibold text-white">
            <User className="size-5" /> Account
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menu ? 'hidden' : '';
  }, [menu]);

  // "/" or Ctrl/Cmd+K opens search from anywhere
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const icon = 'grid size-10 place-items-center rounded-full text-white transition hover:bg-white/10';

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
          scrolled ? 'border-white/10 bg-ink/85 backdrop-blur-xl' : 'border-transparent bg-ink'
        }`}
      >
        <div className={`mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-4 transition-[height] duration-300 sm:px-6 ${scrolled ? 'h-14 lg:h-16' : 'h-[60px] lg:h-[72px]'}`}>
          {/* left: menu button (mobile) / logo (desktop) */}
          <div className="flex items-center">
            <button className={`${icon} -ml-2 lg:hidden`} onClick={() => setMenu(true)} aria-label="Open menu">
              <Menu className="size-6" />
            </button>
            <Link href="/" className="hidden font-wide text-xl font-extrabold tracking-[0.14em] text-white lg:block">
              {SITE.name}
            </Link>
          </div>

          {/* centre: logo (mobile) / menu (desktop) */}
          <Link href="/" className="font-wide text-[16px] font-extrabold tracking-[0.14em] text-white sm:text-lg lg:hidden">
            {SITE.name}
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex xl:gap-7">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className="group relative py-2 text-[13px] font-semibold tracking-[0.08em] text-white/80 uppercase transition hover:text-white">
                {n.label}
                {n.soon && <sup className="ml-1 text-[9px] text-white/45">SOON</sup>}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="-mr-2 flex items-center justify-end gap-0.5 lg:mr-0">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search"
              className="mr-1 hidden h-10 w-44 items-center gap-2.5 rounded-full border border-white/15 px-3.5 text-[13px] text-white/45 transition hover:border-white/35 hover:text-white/70 xl:flex"
            >
              <SearchIcon className="size-4" />
              <span className="flex-1 text-left">Search</span>
              <kbd className="rounded bg-white/10 px-1.5 text-[11px] text-white/50">/</kbd>
            </button>
            <button className={`${icon} xl:hidden`} onClick={() => setSearch(true)} aria-label="Search">
              <SearchIcon className="size-[21px]" />
            </button>
            <Link href="/account" className={`${icon} hidden sm:grid`} aria-label="Account">
              <User className="size-[21px]" />
            </Link>
            <Link href="/cart" className={`${icon} relative`} aria-label={`Bag, ${count} items`}>
              <ShoppingBag className="size-[21px]" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <Search open={search} onClose={() => setSearch(false)} />
      <AnimatePresence>{menu && <MobileDrawer onClose={() => setMenu(false)} />}</AnimatePresence>
    </>
  );
}
