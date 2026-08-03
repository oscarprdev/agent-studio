"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // SSR hydration guard: set in effect to avoid mismatch between server/client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 border-b border-border md:hidden">
        <MobileSidebar />
        <span className="text-lg font-semibold text-foreground">AI Agent Studio</span>
      </div>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="md:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
