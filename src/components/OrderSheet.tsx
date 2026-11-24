'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { SHIPPING, deliveryWindow, inr, waLink, type ShipId } from '@/lib/site';
import { WhatsAppIcon } from './icons';

export type OrderItem = { name: string; color: string; size: string; qty: number; price: number; image: string };

type Props = {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  ship: ShipId;
  onShip: (s: ShipId) => void;
  onPlaced?: () => void;
};

const FIELDS = [
  { k: 'name', label: 'Full name', auto: 'name', type: 'text', req: true, full: true },
  { k: 'phone', label: 'Mobile number', auto: 'tel', type: 'tel', req: true, pattern: '[0-9]{10}', hint: '10-digit mobile number' },
  { k: 'pincode', label: 'PIN code', auto: 'postal-code', type: 'text', req: true, pattern: '[0-9]{6}', hint: '6-digit PIN code', inputMode: 'numeric' as const },
  { k: 'address', label: 'House no., building, street, area', auto: 'street-address', type: 'text', req: true, full: true },
  { k: 'city', label: 'City', auto: 'address-level2', type: 'text', req: true },
  { k: 'state', label: 'State', auto: 'address-level1', type: 'text', req: true },
  { k: 'landmark', label: 'Landmark (optional)', auto: 'off', type: 'text', req: false, full: true },
] as const;

const SAVED = 'solehaus-address';

const loadSaved = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(SAVED) || '{}');
  } catch {
    return {};
  }
};

/** Mounted only while open, so every opening starts fresh (and pre-fills the last address). */
export default function OrderSheet({ open, ...rest }: Props) {
  return <AnimatePresence>{open && <Sheet {...rest} />}</AnimatePresence>;
}

function Sheet({ onClose, items, ship, onShip, onPlaced }: Omit<Props, 'open'>) {
  const [form, setForm] = useState<Record<string, string>>(loadSaved);
  const [touched, setTouched] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.documentElement.style.overflow = '';
    };
  }, [onClose]);

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const fee = SHIPPING[ship].fee;
  const total = subtotal + fee;

  const message = useMemo(() => {
    const lines = items.map((i, n) => `${n + 1}. ${i.name} — ${i.color}, ${i.size} × ${i.qty} = ${inr(i.price * i.qty)}`);
    return [
      'Hi SOLEHAUS! I’d like to place an order 👟',
      '',
      ...lines,
      '',
      `Subtotal: ${inr(subtotal)}`,
      `Shipping: ${SHIPPING[ship].label} (${SHIPPING[ship].days.join('–')} days) — ${fee ? inr(fee) : 'Free'}`,
      `*Total: ${inr(total)}* (Cash on delivery)`,
      '',
      '*Delivery details*',
      `Name: ${form.name ?? ''}`,
      `Mobile: ${form.phone ?? ''}`,
      `Address: ${form.address ?? ''}`,
      `City: ${form.city ?? ''}, ${form.state ?? ''} — ${form.pincode ?? ''}`,
      form.landmark ? `Landmark: ${form.landmark}` : '',
    ]
      .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
      .join('\n');
  }, [items, subtotal, ship, fee, total, form]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!e.currentTarget.checkValidity()) return;
    try {
      localStorage.setItem(SAVED, JSON.stringify(form));
    } catch {}
    window.open(waLink(message), '_blank', 'noopener');
    setPlaced(true);
    onPlaced?.();
  };

  return (
        <motion.div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Order on WhatsApp"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-xl border border-white/10 bg-surface sm:rounded-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <p className="text-[15px] font-bold text-white">{placed ? 'Order sent' : 'Order on WhatsApp'}</p>
              <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            {placed ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-wa text-white"><Check className="size-7" strokeWidth={2.5} /></span>
                <p className="mt-5 text-lg font-semibold text-white">WhatsApp is opening with your order</p>
                <p className="mt-2 max-w-sm text-[14px] text-white/55">Tap send in WhatsApp to confirm. We reply within a few minutes during the day.</p>
                <button onClick={onClose} className="mt-7 h-12 rounded-full bg-white px-7 text-[14px] font-bold text-ink">Done</button>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className={`flex min-h-0 flex-1 flex-col ${touched ? 'was-validated' : ''}`}>
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                  {/* items */}
                  <ul className="space-y-3">
                    {items.map((i, n) => (
                      <li key={n} className="flex items-center gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                          <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1 text-[13px]">
                          <p className="truncate font-semibold text-white">{i.name}</p>
                          <p className="text-white/55">{i.color} · {i.size} · Qty {i.qty}</p>
                        </div>
                        <p className="text-[14px] font-semibold text-white tabular-nums">{inr(i.price * i.qty)}</p>
                      </li>
                    ))}
                  </ul>

                  {/* shipping */}
                  <fieldset>
                    <legend className="mb-2.5 text-[12px] font-semibold tracking-[0.1em] text-white/50 uppercase">Delivery speed</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(SHIPPING) as ShipId[]).map((id) => {
                        const s = SHIPPING[id];
                        const on = ship === id;
                        return (
                          <label key={id} className={`relative cursor-pointer rounded-xl border p-3 transition ${on ? 'border-white bg-white/[0.06]' : 'border-white/15 hover:border-white/35'}`}>
                            <input type="radio" name="ship" className="sr-only" checked={on} onChange={() => onShip(id)} />
                            <p className="text-[13px] font-semibold text-white">{s.label}</p>
                            <p className="mt-0.5 text-[12px] text-white/55">{s.days.join('–')} days · {s.fee ? inr(s.fee) : 'Free'}</p>
                            {on && <Check className="absolute top-3 right-3 size-4 text-white" />}
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[12px] text-white/50">Arrives {deliveryWindow(ship)}</p>
                  </fieldset>

                  {/* details */}
                  <fieldset>
                    <legend className="mb-2.5 text-[12px] font-semibold tracking-[0.1em] text-white/50 uppercase">Delivery details</legend>
                    <div className="grid grid-cols-2 gap-2.5">
                      {FIELDS.map((f) => (
                        <label key={f.k} className={`group block ${'full' in f && f.full ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}>
                          <span className="sr-only">{f.label}</span>
                          <input
                            type={f.type}
                            required={f.req}
                            autoComplete={f.auto}
                            inputMode={'inputMode' in f ? f.inputMode : f.type === 'tel' ? 'numeric' : undefined}
                            pattern={'pattern' in f ? f.pattern : undefined}
                            placeholder={f.label}
                            value={form[f.k] ?? ''}
                            onChange={(e) => setForm((v) => ({ ...v, [f.k]: e.target.value }))}
                            className="peer h-12 w-full rounded-xl border border-white/15 bg-transparent px-4 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white [.was-validated_&]:invalid:border-red-400"
                          />
                          {'hint' in f && <span className="mt-1 hidden text-[11px] text-red-300 [.was-validated_&]:peer-invalid:block">{f.hint}</span>}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                  <div className="mb-3 space-y-1 text-[13px]">
                    <p className="flex justify-between text-white/60"><span>Subtotal</span><span className="tabular-nums">{inr(subtotal)}</span></p>
                    <p className="flex justify-between text-white/60"><span>Shipping</span><span className="tabular-nums">{fee ? inr(fee) : 'Free'}</span></p>
                    <p className="flex justify-between pt-1 text-[15px] font-bold text-white"><span>Total · Cash on delivery</span><span className="tabular-nums">{inr(total)}</span></p>
                  </div>
                  <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-wa py-3.5 text-[15px] font-bold text-white transition hover:brightness-110">
                    <WhatsAppIcon /> Send order on WhatsApp
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
  );
}
