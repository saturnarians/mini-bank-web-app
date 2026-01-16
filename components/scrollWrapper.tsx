"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

interface ScrollWrapperProps {
  children: ReactNode;
  direction?: Direction;
  threshold?: number;
  staggerChildren?: number;
  once?: boolean;
  scale?: boolean;
  className?: string;
}

export const ScrollWrapper: React.FC<ScrollWrapperProps> = ({
  children,
  direction = "up",
  threshold = 0.2,
  staggerChildren = 0,
  once = true,
  scale = true,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) observer.unobserve(ref.current);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(node);

  return () => {
    observer.unobserve(node);
  };
  }, [threshold, once]);

  const offset = 20;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -offset : direction === "right" ? offset : 0,
      y: direction === "up" ? offset : direction === "down" ? -offset : 0,
      scale: scale ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};
