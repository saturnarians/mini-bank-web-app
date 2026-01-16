"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentPage } from "@/store/slices/navigationSlice";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { PhoneOutgoing, Menu, X } from "lucide-react";
import { ToggleTheme } from "@/components/toggleTheme";
import { Button } from "@/components/ui/button";
import { Logo } from "../image";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const pages = ["home", "about", "contact", "login"] as const;

// Memoized static components
const MemoLogo = React.memo(Logo);
const MemoToggleTheme = React.memo(ToggleTheme);

export function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { currentPage } = useAppSelector((state) => state.navigation);
  const [open, setOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");


if (pathname === '/login') {
    return null; 
  }

  // Makes it navigate up when page is clicked
  // const handleNavigation = (page: (typeof pages)[number]) => {
  //   dispatch(setCurrentPage(page));
  //   setOpen(false); // Closes mobile menu if it's open
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  /** ---------- Scroll Direction Hook w/ Throttle ---------- */
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          let newDir: "up" | "down" = scrollDir;

          if (currentScrollY > lastScrollY + 5 && currentScrollY > 50) {
            newDir = "down";
          } else if (currentScrollY < lastScrollY - 5) {
            newDir = "up";
          }

          if (newDir !== scrollDir) setScrollDir(newDir); // only update if changed
          lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollDir]);

  /** ---------- Prevent body scroll when mobile menu is open ---------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  /** ---------- Framer Motion Variants ---------- */
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    }),
    []
  );

  const itemVariants = useMemo(() => ({ hidden: { opacity: 0, y: -5 }, visible: { opacity: 1, y: 0 } }), []);

  const mobileOverlayVariants:Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: "-100%", transition: { duration: 0.35, ease: "easeInOut" } },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeInOut", when: "beforeChildren", staggerChildren: 0.08 },
      },
    }),
    []
  );

  /** ---------- Desktop Navbar ---------- */
  const desktopNavbar = (
    <motion.div
      className="hidden md:flex items-center justify-between px-8 pb-4 w-full fixed top-0 left-0 z-50 "
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: scrollDir === "down" ? "-100%" : "0%",
        opacity: scrollDir === "down" ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ willChange: "transform, opacity" }} // GPU optimization
    >
      <div 
      className="flex justify-start mt-6 cursor-pointer"
      onClick={() => dispatch(setCurrentPage("home"))}
      >
        <MemoLogo />
      </div>

      <motion.ul
        className="glass hidden md:flex justify-center items-center px-2 mt-4 border border-border rounded-full h-13"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {pages.map((page) => (
          <motion.li key={page} variants={itemVariants}>
            <button
              onClick={() => dispatch(setCurrentPage(page))}
              className={`my-1 px-4 py-2 capitalize rounded-full font-medium transition-colors relative group
                ${
                  currentPage === page || pathname === `/${page}`
                    ? "text-primary-foreground/80 border border-border rounded-full bg-primary"
                    : "text-foreground hover:font-semibold hover:text-muted-foreground hover:border hover:border-border hover:rounded-full"
                }`}
            >
              {page}
            </button>
          </motion.li>
        ))}
      </motion.ul>

      <div className="flex items-center gap-4">
        <MemoToggleTheme />
        <Button 
        variant="default" 
        asChild 
        >
          <Link 
          href="/login" 
          target="_blank" 
          rel="noopener noreferrer"
          className="py-6 w-30 shadow-sm hover:bg-primary/80 "
          >
            <PhoneOutgoing size={30} className="font-medium" /> Support
          </Link>
        </Button>
      </div>
    </motion.div>
  );

  /** ---------- Mobile Navbar ---------- */
  const mobileNavbar = (
    <div className="md:hidden fixed top-0 left-0 flex items-center justify-between w-full px-4">
      <div 
      className="flex justify-start mt-6 cursor-pointer"
      onClick={() => dispatch(setCurrentPage("home"))}
      >
        <MemoLogo />
      </div>

      <div className="">
        <button onClick={() => setOpen(!open)} className="relative z-50 flex items-center mt-6">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={40} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={40} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-nav-overlay"
              className="backdrop-blur-sm fixed inset-0 z-40 w-screen h-full top-0 left-0 bg-background/80"
              variants={mobileOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ willChange: "transform, opacity" }}
            >
              <motion.ul
                className="flex flex-col justify-center items-center gap-3 px-4 pt-10 mt-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {pages.map((page) => (
                  <motion.li key={page} variants={itemVariants}>
                    <button
                      onClick={() => {
                        dispatch(setCurrentPage(page));
                        setOpen(false);
                      }}
                      className={`px-4 py-2 capitalize font-medium transition-colors
                        ${
                          currentPage === page
                            ? "text-accent"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {page}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <nav className="relative w-full">
      {desktopNavbar}
      {mobileNavbar}
    </nav>
  );
}
