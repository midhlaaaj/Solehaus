'use client';

import { motion } from 'motion/react';

/** Fade/rise into view once, when scrolled to. */
export default function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <Reveal className="mb-5 flex items-end justify-between gap-6 sm:mb-9">
      <div>
        <h2 className="font-wide text-[clamp(22px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.01em] text-white uppercase">{title}</h2>
        {sub && <p className="mt-2 max-w-lg text-[13px] text-white/55 sm:mt-3 sm:text-[15px]">{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}
