"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Mail, Send } from "lucide-react"
import { useState } from "react"

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

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

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Form submitted:", data)
      setSubmitSuccess(true)
      reset()
      setTimeout(() => setSubmitSuccess(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.article variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.header variants={itemVariants}>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contact</h2>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I'm always interested in hearing about new projects and opportunities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:richard@example.com" className="text-foreground hover:text-accent transition-colors">
                  richard@example.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Follow me on social media:</p>
            <div className="flex gap-3">
              {["Facebook", "Twitter", "Instagram"].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {social[0]}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm"
            >
              Message sent successfully! I'll get back to you soon.
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
              <input
                {...register("firstName")}
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-accent outline-none transition-colors"
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <input
                {...register("lastName")}
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-accent outline-none transition-colors"
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-accent outline-none transition-colors"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              {...register("message")}
              className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-accent outline-none transition-colors resize-none"
              rows={4}
              placeholder="Your message here..."
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </motion.form>
      </div>
    </motion.article>
  )
}



/**
 * 
 * "use client"
 * 
import React, { useEffect, useState } from "react";
import Header from "./Header";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      <Header />
      <main style={{padding:'3rem 1rem'}}>
        <h1 className="fade-in">Contact us</h1>
        <p className="fade-in">Send us a message and we'll get back within one business day.</p>

        <form className="contact-form fade-in" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <input placeholder="Your name" name="name" />
          <input placeholder="Email" name="email" />
          <textarea placeholder="Message" name="message" rows={6} />
          <button type="submit" className="pl-btn">Send</button>
          {submitted && <div role="status">Thanks — we'll be in touch.</div>}
        </form>
      </main>
    </div>
  );
}

 */