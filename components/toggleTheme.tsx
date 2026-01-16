"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ToggleTheme() {
    const [ mounted, setMounted ] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLight = theme === "light";

    const toggleTheme = () => {
        const newTheme = isLight ? 'dark' : 'light';
        setTheme(newTheme);
    };

    if(!mounted) return <Button className='rounded-full h-8 w-8' disabled />;

    const Icon = isLight ? Moon : Sun;

  return (
    <motion.div
        onClick={toggleTheme}
        className='transition'
        // size="icon"
        aria-label="Toggle theme" 
    >
          {/* Animate the icon switch for better UX */}
          <motion.div
            key={isLight ? "sun" : "moon"}
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -180 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-4 w-4 text-gray" />
          </motion.div>
    </motion.div>
  )
}
