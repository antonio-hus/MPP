"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import { useAuth } from "@/components/AuthProvider"

export default function AuthPage() {
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !loading) {
      router.push("/")
    }
  }, [isLoggedIn, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto py-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2196F3] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Booking System</h1>
          <p className="text-center text-muted-foreground mb-10">
            Please login or register to continue to the booking management system.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Login with your existing account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  If you already have an account, login to access your bookings, hotels, and rooms.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full bg-[#2196F3] hover:bg-[#1976D2]">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  New to the booking system? Create an account to start managing your bookings.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full bg-[#FF9800] hover:bg-[#F57C00]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
