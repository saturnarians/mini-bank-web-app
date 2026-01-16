"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  isActive: boolean
}

export function PageWrapper({ children, isActive }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={isActive ? "block" : "hidden"}
    >
      {children}
    </motion.div>
  )
}
