"use client";
import React, { useEffect } from "react";
import { Hero } from "./hero-section";
import { Features } from "./features-section";
import { Button } from "../ui/button";
import Link from "next/link";
import { TrendingUp } from 'lucide-react';
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";



export function Home() {

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const slides = [
    <div>
      <h2>Secure accounts tailored for you</h2>
      <p>Trusted by communities — personal and business banking.</p>
    </div>,
    <div>
      <h2>Fast transfers</h2>
      <p>Move money instantly with low fees and strong encryption.</p>
    </div>,
    <div>
      <h2>24/7 Support</h2>
      <p>Our team is here whenever you need help.</p>
    </div>,
  ];

  return (
    <section className="flex flex-col justify-center items-center w-auto px-6 m-2">
      <main id="home" className="">
          <div className="flex flex-col justify-center space-y-4 items-center mb-2 border-b border-border w-auto">
            <div className="md:mr-8 border border-border rounded-full ">
            <p className="fade-in font-medium items-center text-xs text-foreground px-1 md:p-2">
              Your future begins with Patheon.
            </p>
            </div>
            <div className="flex flex-col items-center justify-center  text-wrap text-center">
               <h1 className="fade-in text-2xl font-semibold md:p-4 mb-4"> $500 Checking bonus On Us</h1>
               <p className="fade-in text-xl font-medium px-2 pb-4"> New customers open an eligible checking account with qualifying direct deposits</p> 
            </div>
            <Button
            variant="default"
            asChild
            className="fade-in px-6 text-2xl font-medium  shadow-sm hover:bg-primary/80 py-6 w-50"
            >
              <Link href="/login">
              Get Started <TrendingUp size={70} className="font-medium"/>
              </Link>
            </Button>
          </div>
        <div>
          <Hero />
        </div>
        <div>
          <Features />
        </div>
      </main>

    </section>
  );
}
