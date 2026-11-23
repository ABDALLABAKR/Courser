import { motion } from 'motion/react';
import { usePrefs } from '../lib/prefs';

/** Animated game logo: a pencil sweeping a stroke under the Kurdish title. */
export function Logo({ small }: { small?: boolean }) {
  const reduce = usePrefs((p) => p.reduceMotion);
  const title = 'وێنە بکێشە';
  return (
    <div className={`relative mx-auto flex flex-col items-center ${small ? 'scale-[.55] -my-6' : ''}`} dir="rtl">
      <div className="relative">
        <motion.svg viewBox="0 0 120 120" className="absolute -top-12 -left-4 h-14 w-14 sm:-top-8 sm:-left-16 sm:h-24 sm:w-24"
          initial={reduce ? false : { rotate: -30, x: -20, opacity: 0 }} animate={{ rotate: 0, x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 }} aria-hidden>
          <g className={reduce ? '' : 'anim-wiggle'}>
            <path d="M28 92 L78 32 L92 44 L42 104 L24 108 Z" fill="#FFCA45" stroke="#18243B" strokeWidth="5" strokeLinejoin="round" />
            <path d="M78 32 L86 22 L100 34 L92 44 Z" fill="#FF746A" stroke="#18243B" strokeWidth="5" strokeLinejoin="round" />
            <path d="M24 108 L28 92 L42 104 Z" fill="#F4D6B0" stroke="#18243B" strokeWidth="4" strokeLinejoin="round" />
            <path d="M24 108 l2-7 5 4z" fill="#18243B" />
          </g>
        </motion.svg>
        <motion.h1
          className="relative z-10 text-center font-black leading-none text-navy dark:text-white"
          style={{ fontSize: 'clamp(3rem, 13vw, 5.5rem)', textShadow: '0 4px 0 #20C5C5, 0 8px 0 rgba(24,36,59,.18)' }}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          {title}
        </motion.h1>
      </div>
      <svg viewBox="0 0 300 30" className="-mt-1 h-6 w-64 sm:w-80" aria-hidden>
        <motion.path d="M8 18 C 60 4, 110 28, 160 14 S 260 6, 292 16" stroke="#FF746A" strokeWidth="7" fill="none" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }} />
      </svg>
      <div className="font-display mt-1 text-lg font-bold tracking-[0.35em] text-teal-dark dark:text-teal ltr">WÊNE BIKÊŞE</div>
    </div>
  );
}
