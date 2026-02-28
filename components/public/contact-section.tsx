"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Building2, Clock3, Headset, Mail, Phone, Send } from "lucide-react"
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
    <motion.article 
    variants={containerVariants} 
    initial="hidden" 
    animate="visible" 
    className="space-y-8 m-8 px-8 "
    >
      {/* Header */}
      <motion.header variants={itemVariants}>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Contact Patheon Bank</h2>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Need help with your account, transaction review, or business banking support? Our customer care and
              operations teams are available to assist with fast, clear, and secure service.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:support@patheonbnk.com" className="text-foreground hover:text-accent transition-colors">
                  support@patheonbnk.com
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:+18005550100" className="text-foreground hover:text-accent transition-colors">
                  +1 (800) 555-0100
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <p>Support Hours</p>
              </div>
              <p className="text-sm text-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p className="text-sm text-foreground">Saturday: 9:00 AM - 2:00 PM</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <p>Head Office</p>
              </div>
              <p className="text-sm text-foreground">Patheon Plaza, 250 Market Street, San Francisco, CA</p>
            </div>
          </div>

          {/* <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Follow Patheon Bank:</p>
            <div className="flex gap-3">
              {["LinkedIn", "X", "Facebook"].map((social) => (
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
          </div> */}
        </motion.div>

        {/* Contact Form */}
        <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Headset className="h-4 w-4" />
            <p>Customer Support Form</p>
          </div>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm"
            >
              Message received. A Patheon Bank representative will contact you shortly.
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
                placeholder="you@company.com"
              />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              {...register("message")}
              className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:border-accent outline-none transition-colors resize-none"
              rows={4}
              placeholder="Tell us how we can help. Include account or transaction context if relevant."
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <Button
            variant="default"
            type="submit"
            disabled={isSubmitting}
            className="gap-2 "
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </motion.form>
      </div>
    </motion.article>
  )
};