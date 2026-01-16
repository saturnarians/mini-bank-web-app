"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

interface Props {
  slides: React.ReactNode[];
}

export function Carousel({ slides }: Props) {
  // viewportRef is the element Embla controls
  const [viewportRef, embla] = useEmblaCarousel({ loop: true });

  // Navigation helpers
  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);

  return (
    <div className="relative">
      {/* Viewport */}
      <div className="overflow-hidden" ref={viewportRef}>
        {/* Track = flex row */}
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="flex-[0_0_100%] px-2">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2"
      >
        Prev
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        Next
      </button>
    </div>
  );
}
