"use client";

import { useEffect, useState } from "react";

// Tracks scroll direction to hide/show header smoothly
export function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastY = window.scrollY;

    const handler = () => {
      const y = window.scrollY;
      if (y > lastY && y > 10) setDirection("down");
      else setDirection("up");
      lastY = y;
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return direction;
}
