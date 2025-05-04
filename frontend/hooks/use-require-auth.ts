"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname.startsWith("/auth")) {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/auth")
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router, pathname])

  return { isLoading, isAuthenticated }
}
