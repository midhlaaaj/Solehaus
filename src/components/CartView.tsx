'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Banknote, Check, Minus, Package, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { bestsellers, getProduct, productHref } from '@/lib/products';
import { SHIPPING, deliveryWindow, inr, type ShipId } from '@/lib/site';
import { useCart } from './cart';
import { WhatsAppIcon } from './icons';
import OrderSheet from './OrderSheet';
import ProductRail from './ProductRail';
import { SectionHead } from './Reveal';

const lineHref = (handle: string, color: string) => {
  const p = getProduct(handle);
  return p ? productHref(p, color) : `/products/${handle}`;
};

export default function CartView() {
  const { loaded: ready, lines, count, subtotal, setQty, remove, clear } = useCart();
  const [ship, setShip] = useState<ShipId>('fast');
  const params = useSearchParams();
  const router = useRouter();
  // arriving from the bag pop-up's "Checkout" button opens the order sheet straight away
  const [order, setOrder] = useState(() => params.get('checkout') === '1');

  useEffect(() => {
    if (params.get('checkout')) router.replace('/cart', { scroll: false });
  }, [params, router]);

  const fee = SHIPPING[ship].fee;
  if (!ready) return <div className="min-h-[70svh]" />;

  if (!lines.length) {
    return (
      <>
        <div className="mx-auto flex max-w-[1400px] flex-col items-center px-4 pt-16 pb-6 text-center sm:px-6 sm:pt-24">
          <span className="grid size-16 place-items-center rounded-full border border-white/15"><ShoppingBag className="size-7 text-white" strokeWidth={1.5} /></span>
          <h1 className="mt-6 font-wide text-[clamp(26px,4vw,44px)] font-extrabold text-white uppercase">Your bag is empty</h1>
          <p className="mt-2 text-[14px] text-white/55">Find your next pair below.</p>
          <Link href="/shop" className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold text-ink">
            Start shopping <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
        <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
          <SectionHead title="Bestsellers" />
          <ProductRail items={bestsellers()} />
        </section>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <h1 className="font-wide text-[clamp(26px,4vw,48px)] leading-none font-extrabold text-white uppercase">
          Your bag <span className="text-white/35">({count})</span>
        </h1>
        <button onClick={clear} className="text-[13px] text-white/50 underline-offset-4 hover:text-white hover:underline">Clear bag</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <ul className="divide-y divide-white/10 border-y border-white/10">
          <AnimatePresence initial={false}>
            {lines.map((l, i) => (
              <motion.li key={`${l.handle}-${l.color}-${l.size}`} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="flex gap-4 py-5">
                <Link href={lineHref(l.handle, l.color)} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-surface sm:w-28">
                  <Image src={l.image} alt="" fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={lineHref(l.handle, l.color)} className="line-clamp-2 text-[15px] font-semibold text-white hover:underline">{l.name}</Link>
                      <p className="mt-1 text-[13px] text-white/55">{l.color} · {l.size}</p>
                    </div>
                    <p className="text-[15px] font-semibold text-white tabular-nums">{inr(l.price * l.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex h-10 items-center rounded-full border border-white/15">
                      <button onClick={() => setQty(i, l.qty - 1)} disabled={l.qty <= 1} aria-label="Decrease quantity" className="grid size-10 place-items-center text-white disabled:opacity-30"><Minus className="size-4" /></button>
                      <span className="w-7 text-center text-[14px] font-semibold text-white tabular-nums">{l.qty}</span>
                      <button onClick={() => setQty(i, l.qty + 1)} aria-label="Increase quantity" className="grid size-10 place-items-center text-white"><Plus className="size-4" /></button>
                    </div>
                    <button onClick={() => remove(i)} aria-label={`Remove ${l.name}`} className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white">
                      <Trash2 className="size-4" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="h-fit rounded-xl border border-white/10 bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="text-[15px] font-bold text-white">Order summary</p>
          <fieldset className="mt-5">
            <legend className="mb-2.5 text-[12px] font-semibold tracking-[0.1em] text-white/45 uppercase">Delivery</legend>
            <div className="space-y-2">
              {(Object.keys(SHIPPING) as ShipId[]).map((id) => {
                const s = SHIPPING[id];
                const on = ship === id;
                return (
                  <label key={id} className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${on ? 'border-white' : 'border-white/15 hover:border-white/35'}`}>
                    <input type="radio" name="cart-ship" className="sr-only" checked={on} onChange={() => setShip(id)} />
                    <span>
                      <span className="block text-[13px] font-semibold text-white">{s.label}</span>
                      <span className="block text-[12px] text-white/50">Arrives {deliveryWindow(id)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                      {s.fee ? inr(s.fee) : 'Free'} {on && <Check className="size-4" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-[14px]">
            <p className="flex justify-between text-white/65"><span>Subtotal</span><span className="tabular-nums">{inr(subtotal)}</span></p>
            <p className="flex justify-between text-white/65"><span>Shipping</span><span className="tabular-nums">{fee ? inr(fee) : 'Free'}</span></p>
            <p className="flex justify-between pt-2 text-[17px] font-bold text-white"><span>Total</span><span className="tabular-nums">{inr(subtotal + fee)}</span></p>
          </div>
          <button onClick={() => setOrder(true)} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-wa text-[15px] font-bold text-white transition hover:brightness-110">
            <WhatsAppIcon /> Checkout on WhatsApp
          </button>
          <p className="mt-3 text-center text-[12px] text-white/45">Pay cash on delivery. Your order is confirmed on WhatsApp.</p>
          <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-[13px] text-white/65">
            <li className="flex items-center gap-2.5"><Banknote className="size-4 text-white" />Cash on delivery</li>
            <li className="flex items-center gap-2.5"><Truck className="size-4 text-white" />Tracking updates after dispatch</li>
            <li className="flex items-center gap-2.5"><Package className="size-4 text-white" />Branded box + safety box</li>
          </ul>
        </aside>
      </div>

      <OrderSheet open={order && ready && lines.length > 0} onClose={() => setOrder(false)} items={lines} ship={ship} onShip={setShip} onPlaced={() => setTimeout(clear, 1500)} />
    </div>
  );
}
