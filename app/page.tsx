"use client";

import { useEffect } from "react"
import { Navbar } from "@/components/public/nav-section"
import { Footer } from "@/components/public/footer-section"
import { AboutSection } from "@/components/public/about-section"
import { Home } from "@/components/public/home-section";
import { ContactSection } from "@/components/public/contact-section"
import { PageWrapper } from "@/components/public/page-wrapper"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
// import { setIsMobile } from "@/store/slices/uiSlice"
import { LoginForm } from '@/components/public/login-form';

// when you initiate sentry you add un-comment the sentry export below
//  the codes and remove the export default function MainContent and leave only Main content
export default function MainContent() {
  const { currentPage } = useAppSelector((state) => state.navigation)
  // const dispatch = useAppDispatch()

  // useEffect(() => {
  //   // Set up mobile detection
  //   const handleResize = () => {
  //     dispatch(setIsMobile(window.innerWidth < 768))
  //   }

  //   handleResize()
  //   window.addEventListener("resize", handleResize)
  //   return () => window.removeEventListener("resize", handleResize)
  // }, [dispatch])

  return (
    <div className="min-h-screen bg-background">
      {/* <LoginPage /> */}
      <div className="w-full flex flex-col space-y-26 min-h-screen">
        <Navbar />
        <main className="flex-1 w-auto mx-auto max-w-full px-2 md:px-4 py-8"> 
          <PageWrapper isActive={currentPage === "home"}>
            <Home />
          </PageWrapper>

          <PageWrapper isActive={currentPage === "about"}>
            <AboutSection />
          </PageWrapper>

          <PageWrapper isActive={currentPage === "contact"}>
            <ContactSection />
          </PageWrapper>

          <PageWrapper isActive={currentPage === "login"}>
            <LoginForm />
          </PageWrapper>
        </main>
        <Footer />
      </div>
     {/* </div> */}
    </div>
  )
}
