"use client"
import React, { useEffect, useState } from "react";

export default function TypingText({ texts = [] }: { texts: string[] }) {
  const [i, setI] = useState(0);
  const [pos, setPos] = useState(0);
  const [forward, setForward] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (forward) {
        if (pos < texts[i].length) setPos((p) => p + 1);
        else setForward(false);
      } else {
        if (pos > 0) setPos((p) => p - 1);
        else {
          setForward(true);
          setI((x) => (x + 1) % texts.length);
        }
      }
    }, forward ? 80 : 30);
    return () => clearTimeout(timeout);
  }, [pos, forward, i, texts]);

  return <span className="typing">{texts.length ? texts[i].slice(0, pos) : ""}<span className="typing-caret">|</span></span>;
}
