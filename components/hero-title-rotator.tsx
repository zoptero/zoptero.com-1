"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const TITLE_VARIANTS = ["Expertu meklētājs", "Pakalpojumu meklētājs"] as const;
const ROTATION_INTERVAL_MS = 2600;
const TRANSITION = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function HeroTitleRotator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TITLE_VARIANTS.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion]);

  return (
    <h1
      className="text-3xl font-bold lg:text-5xl xl:text-6xl text-center"
      aria-label="Expertu meklētājs un pakalpojumu meklētājs"
    >
      <span className="sr-only">Expertu meklētājs un pakalpojumu meklētājs</span>
      <span
        aria-hidden="true"
        className="relative mx-auto block h-[1.25em] min-w-[22ch] overflow-hidden leading-tight whitespace-nowrap"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={TITLE_VARIANTS[activeIndex]}
            className="absolute inset-0 block whitespace-nowrap text-center will-change-transform"
            initial={prefersReducedMotion ? false : { y: "100%", opacity: 0.9 }}
            animate={prefersReducedMotion ? { y: "0%", opacity: 1 } : { y: "0%", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0.9 }}
            transition={TRANSITION}
          >
            {TITLE_VARIANTS[activeIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}