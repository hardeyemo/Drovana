"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Children, useRef, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

/** A small, one-time reveal that stays visible when motion is reduced. */
export function ScrollReveal({ children, className, delay = 0, direction = "up" }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion !== false;
  const offset = direction === "left" ? { x: -20 } : direction === "right" ? { x: 20 } : { y: 18 };

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/** Lightweight stagger for card grids; each child animates once as it enters view. */
export function StaggerGrid({ children, className }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion !== false;
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.075, delayChildren: reduceMotion ? 0 : 0.025 } },
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="h-full min-w-0"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Low-amplitude scroll-follow motion for decorative artwork. */
export function ScrollParallax({ children }: { children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion !== false;
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, (progress) =>
    reduceMotion ? 0 : (0.5 - progress) * 22,
  );

  return (
    <motion.div ref={target} style={{ y }}>
      {children}
    </motion.div>
  );
}
