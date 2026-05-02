'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashSaleBannerProps {
  title: string;
  subtitle?: string;
  endsAt: Date;
  className?: string;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function FlashSaleBanner({ title, subtitle, endsAt, className }: FlashSaleBannerProps) {
  const [remaining, setRemaining] = useState(() => endsAt.getTime() - Date.now());
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(endsAt.getTime() - Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-md md:p-8',
        className,
      )}
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              reduce
                ? undefined
                : { scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }
            }
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur"
          >
            <Flame className="size-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-poppins text-h3 font-bold leading-tight md:text-h3-md">{title}</h3>
            {subtitle && (
              <p className="mt-1 text-sm text-primary-100 md:text-base">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-poppins font-semibold text-primary-700 tabular-nums">
          <span className="text-xs uppercase tracking-wider text-primary-600">Fin dans</span>
          <span className="text-base">{formatRemaining(remaining)}</span>
        </div>
      </div>
    </motion.div>
  );
}
