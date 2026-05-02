'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  pathKey: string;
  children: ReactNode;
}

export function PageTransition({ pathKey, children }: PageTransitionProps) {
  const reduce = useReducedMotion();
  const variants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
