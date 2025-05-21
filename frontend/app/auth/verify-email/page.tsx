"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { verifyEmail } from "@/utils/api/users-api"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const uid = searchParams.get("uid")
    const token = searchParams.get("token")

    if (!uid || !token) {
      setError("Invalid verification link. Missing parameters.")
      setIsLoading(false)
      return
    }

    const verifyUserEmail = async () => {
      try {
        const message = await verifyEmail(uid, token)
        setSuccess(message || "Email verification successful! You can now log in.")
        // After a successful verification, we'll redirect to the login page with a success parameter
        setTimeout(() => {
          router.push("/auth/login?verified=true")
        }, 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Email verification failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyUserEmail()
  }, [searchParams, router])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
              <CardDescription className="text-center">Verifying your email address</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2196F3]" />
                  <p className="mt-4 text-muted-foreground">Verifying your email...</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Success</AlertTitle>
                  <AlertDescription className="text-green-600">
                    {success}
                    <div className="mt-2">Redirecting to login page...</div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              {!isLoading && (
                <Link href="/auth/login">
                  <Button className="bg-[#2196F3] hover:bg-[#1976D2]">Go to Login</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
