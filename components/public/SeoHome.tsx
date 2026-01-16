"use client"
import React, { useEffect, useRef, useState } from "react";
import TypingText from "./TypingText";
import Meta from "./Meta";

export default function SeoHome() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "Banking made simple", subtitle: "Secure. Fast. Trusted by businesses." },
    { title: "Savings that grow", subtitle: "Competitive interest and easy access." },
    { title: "Smart payments", subtitle: "Seamless transfers and instant notifications." },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (!el) return;
      if (window.scrollY > 20) el.classList.add("scrolled");
      else el.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Meta title="westinLand Bank — Home" description="Modern banking: secure accounts, smart payments and tailored services.">
      <section aria-label="WestinLand Bank home">
        <header ref={headerRef} className="pl-header">
          <div className="pl-container">
            <div className="pl-logo">westinLand Bank</div>
            <nav className="pl-nav">
              <a href="#services">Services</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </header>

        <div className="hero">
          <div className="hero-inner">
            <div style={{ flex: 1 }}>
              <h1>
                <TypingText texts={["Welcome to westinLand Bank", "Trust. Growth. Service."]} />
              </h1>
              <p className="fade-in visible">Modern banking tools for people and businesses.</p>
              <div style={{ marginTop: "1rem" }}>
                <button className="pl-btn">Get Started</button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="carousel" role="region" aria-roledescription="carousel">
                {slides.map((s, i) => (
                  <div key={i} className={i === slide ? "carousel-slide active" : "carousel-slide"}>
                    <div>
                      <h2>{s.title}</h2>
                      <p>{s.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section id="services" style={{ padding: "2rem 1rem" }}>
          <div className="pl-container">
            <div className="fade-in visible">
              <h3>Key features</h3>
              <ul>
                <li>Online accounts</li>
                <li>24/7 support</li>
                <li>Safe transfers</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </Meta>
  );
}
