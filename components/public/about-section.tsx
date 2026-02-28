// "use client"
// import React, { useEffect } from "react";
// import Header from "./Header";
// import Accordion from "./Accordion";

// export default function About() {
//   useEffect(() => {
//     const obs = new IntersectionObserver((entries) => {
//       entries.forEach((e) => {
//         if (e.isIntersecting) e.target.classList.add("visible");
//       });
//     }, { threshold: 0.12 });
//     document.querySelectorAll('.fade-in').forEach((el) => obs.observe(el));
//     return () => obs.disconnect();
//   }, []);

//   return (
//     <div>
//       <Header />
//       <main style={{padding:'3rem 1rem'}}>
//         <h1 className="fade-in">About westinLand Bank</h1>
//         <p className="fade-in">We craft modern banking products with a focus on trust and transparency.</p>
//         <section style={{marginTop:20}}>
//           <Accordion items={[
//             { title: 'History', content: 'Founded to serve local communities with modern tooling.' },
//             { title: 'Leadership', content: 'Experienced leaders from finance and tech.' },
//             { title: 'Security', content: 'Industry-standard encryption and fraud monitoring.' },
//           ]} />
//         </section>
//       </main>
//     </div>
//   );
// }

"use client"

import { motion } from "framer-motion"
import { BadgeCheck, BriefcaseBusiness, HandCoins, Landmark, ShieldCheck } from "lucide-react"
// import { useAppSelector } from "@/store/hooks"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function AboutSection() {
  const highlights = [
    {
      icon: Landmark,
      title: "Digital Banking",
      description:
        "Open accounts in minutes, manage cards, and move money securely from a single dashboard.",
    },
    {
      icon: HandCoins,
      title: "Lending and Credit",
      description:
        "Flexible personal and business lending designed around clear terms and predictable repayment plans.",
    },
    {
      icon: ShieldCheck,
      title: "Security and Fraud Defense",
      description:
        "Multi-layer account protection with encryption, anomaly monitoring, and real-time transaction alerts.",
    },
    {
      icon: BriefcaseBusiness,
      title: "Business Banking",
      description:
        "Treasury-ready tools for SMEs and growing teams, including payment controls and transaction visibility.",
    },
  ]

  return (
    <motion.article 
    variants={containerVariants} 
    initial="hidden" 
    animate="visible" 
    className="space-y-8 m-8 px-8"
    >
      {/* Header */}
      <motion.header variants={itemVariants}>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">About Patheon Bank</h2>
      </motion.header>

      {/* About Text */}
      <motion.section variants={itemVariants} className="space-y-4 text-muted-foreground">
        <p className="leading-relaxed">
          Patheon Bank is a modern financial institution focused on secure, transparent, and accessible banking for
          individuals, families, and businesses. We combine proven banking discipline with digital-first tools that make
          everyday money management simpler.
        </p>
        <p className="leading-relaxed">
          Our mission is to help customers build confidence in every financial decision through reliable service, strong
          risk controls, and products designed around real customer needs. From savings goals to business operations,
          Patheon Bank is built to support long-term financial growth.
        </p>
      </motion.section>

      {/* Services */}
      <motion.section variants={itemVariants} className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">What We Offer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Principles */}
      <motion.section variants={itemVariants} className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Our Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: BadgeCheck, label: "Customer-first service standards" },
            { icon: Landmark, label: "Responsible and compliant banking" },
            { icon: ShieldCheck, label: "Continuous investment in security" },
          ].map((principle) => (
            <motion.div
              key={principle.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground"
            >
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                <principle.icon className="h-4 w-4" />
              </div>
              <p>{principle.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.article>
  )
}
