'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { inr } from '@/lib/site';

export type CartLine = { handle: string; name: string; color: string; size: string; price: number; image: string; qty: number };

type Ctx = {
  loaded: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (l: Omit<CartLine, 'qty'>, qty?: number) => void;
  setQty: (i: number, qty: number) => void;
  remove: (i: number) => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = 'solehaus-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [toast, setToast] = useState<CartLine | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Read the saved bag after hydration (localStorage doesn't exist on the server, so this
  // can't be a lazy initial state without a hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // only persist after the saved bag has been read, so we never overwrite it with []
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((l: Omit<CartLine, 'qty'>, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((p) => p.handle === l.handle && p.color === l.color && p.size === l.size);
      if (i === -1) return [...prev, { ...l, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(10, next[i].qty + qty) };
      return next;
    });
    setToast({ ...l, qty });
  }, []);
  const setQty = useCallback((i: number, qty: number) => setLines((prev) => prev.map((l, k) => (k === i ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l))), []);
  const remove = useCallback((i: number) => setLines((prev) => prev.filter((_, k) => k !== i)), []);
  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);

  return (
    <CartCtx.Provider value={{ loaded, lines, count, subtotal, add, setQty, remove, clear }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed top-24 right-4 z-[80] w-[min(360px,calc(100%-32px))] rounded-lg border border-white/10 bg-surface p-4 shadow-2xl shadow-black/60"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="grid size-5 place-items-center rounded-full bg-white text-ink"><Check className="size-3" strokeWidth={3} /></span>
                Added to your bag
              </p>
              <button onClick={() => setToast(null)} aria-label="Close" className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <Image src={toast.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-white">{toast.name}</p>
                <p className="text-white/55">{toast.color} · {toast.size}{toast.qty > 1 ? ` · Qty ${toast.qty}` : ''}</p>
                <p className="mt-1 text-white">{inr(toast.price)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={() => setToast(null)} className="flex h-11 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white hover:bg-white/10">
                View bag ({count})
              </Link>
              <Link href="/cart?checkout=1" onClick={() => setToast(null)} className="flex h-11 items-center justify-center rounded-full bg-white text-sm font-bold text-ink hover:bg-white/90">
                Checkout
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart outside CartProvider');
  return c;
}
