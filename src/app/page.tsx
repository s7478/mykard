"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import Header from "@/components/Header"
import Homepage from "@/components/Homepage"
import TopFooter from "@/components/TopFooter"
import Footer from "@/components/Footer"

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth, isLoading } = useAuth()

  useEffect(() => {
    // Only check auth once on mount
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // If redirected from another page with a target section, scroll to it smoothly
  useEffect(() => {
    if (typeof window === 'undefined') return
    let target: string | null = null
    try {
      target = sessionStorage.getItem('scrollTarget')
      if (target) sessionStorage.removeItem('scrollTarget')
    } catch { }
    if (target) {
      // wait for homepage sections to render
      const attemptScroll = () => {
        const el = document.getElementById(target as string)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return true
        }
        return false
      }
      if (!attemptScroll()) {
        const id = window.setInterval(() => {
          if (attemptScroll()) window.clearInterval(id)
        }, 100)
        // safety stop after 3s
        window.setTimeout(() => window.clearInterval(id), 3000)
      }
    }
  }, [])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Homepage />
      </main>
      <TopFooter />
      <Footer />
    </div>
  )
}
