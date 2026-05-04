"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInSlideProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function FadeInSlide({
  children,
  delay = 0,
  duration = 0.6,
  className = "",
}: FadeInSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1], // Ease-Out-Expo
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}