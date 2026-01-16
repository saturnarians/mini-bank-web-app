"use client";

import Image from "next/image";

export function Logo() {
  return (
    <div className="shadow-custom ring-2 ring-primary rounded-full overflow-hidden">
        <Image 
          src="/icon.png" 
          alt="Patheon Bank" 
          width={80} 
          height={80} 
          priority // Ensures the logo loads fast as a key UI element
        />
        </div>
        // {/* <h3> Patheon Bank </h3> */}
      
  );
}