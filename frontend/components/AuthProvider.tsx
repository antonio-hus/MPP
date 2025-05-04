"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/utils/api/users-api"

interface AuthContextType {
  isLoggedIn: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      setLoading(false)

      // Redirect logic
      if (authenticated && pathname.startsWith("/auth")) {
        router.push("/")
      } else if (!authenticated && !pathname.startsWith("/auth")) {
        router.push("/auth")
      }
    }

    checkAuth()

    // Listen for storage events (for when token is added/removed in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [pathname, router])

  return <AuthContext.Provider value={{ isLoggedIn, loading }}>{children}</AuthContext.Provider>
}
