"use client";

import { Carousel } from "../ui/carousel"; // Adjust path as needed
import { motion } from "framer-motion";
import React, { useCallback } from 'react';

interface HeroSectionProps {
  slides: React.ReactNode
}

export function HeroSection({slides}:HeroSectionProps) {

//   const scrollPrev = useCallback(() => {
//     if (embla) embla.scrollPrev();
//    }, [embla]);

  // 1. Define your slides as an array of JSX elements
  const slideElements = [1, 2, 3].map((n) => (
    <motion.div
      key={n}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-[60vh] flex flex-col justify-center items-center text-center bg-slate-50 rounded-2xl border"
    >
      <h1 className="text-4xl font-bold">Trusted Digital Banking #{n}</h1>
      <p className="text-gray-600 mt-2">Secure. Fast. Designed for humans.</p>
    </motion.div>
  ));

  return (
    <section className="pt-10 px-4">
      <div className="w-auto mx-auto">
        {/* 2. Pass the array to the 'slides' prop */}
        <Carousel slides={slideElements} />
      </div>
    </section>
  );
}