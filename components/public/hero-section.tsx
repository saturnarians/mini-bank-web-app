import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; 

export const Hero = () => {
  return (
    <section className="bg-background text-foreground text-wrap text-center flex flex-col items-center justify-center px-4 py-8 border-b border-border">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-center"
      >
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Seamless online <br />
            <span className="text-gray-400">payment integration</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            Get enterprise-grade protection with 4x FDIC coverage through our innovative multi-bank network.
          </p>
          <Button
          variant="default"
          className="bg-primary hover:bg-primary/80 shadow-sm rounded-full px-8 py-6 text-sm md:text-lg font-medium mb-6"
          >
            Secure your funds now ↗
          </Button>
        </div>

        {/* Glassmorphic Bank Card */}

        <div className="relative">
          <div className="bg-primary/90 backdrop-blur-sm border border-border/10 rounded-3xl p-8 shadow-2xl">
            <div className="bg-[#4ade80]/20 text-[#4ade80] w-fit px-4 py-1 rounded-full text-xs mb-4">
              100% Protected
            </div>
            <h3 className="text-2xl font-semibold text-primary-foreground/60">Patheon Bank</h3>
            <p className="text-primary-foreground/40 text-sm mb-6">Multi-Bank Protection</p>
            <div className="text-4xl font-bold mb-2 text-primary-foreground/60">$1,000,000</div>
            <p className="text-primary-foreground/40 text-xs mb-8">4x FDIC Insurance Coverage</p>
            
            <div className="space-y-3">
              {['Nation Bank', 'ADIB Bank', 'ADCB Bank'].map((bank) => (
                <div key={bank} className="flex justify-between items-center glass text-primary-foreground/60 p-4 rounded-full">
                  <span className="text-sm ">{bank}</span>
                  <span className="text-sm font-mono">$250k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};