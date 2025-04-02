"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBookingApi } from "@/utils/api/bookings-api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar";


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function CreateBookingPage() {
  // CONSTANTS SECTION //
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    state: "PENDING",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // HANDLERS //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setError("Start date must be before the end date.")
      setIsLoading(false)
      return
    }

    try {
      await createBookingApi(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/bookings")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // JSX SECTION//
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar/>
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6">
            <h1 className="text-2xl font-bold text-center">Create Booking</h1>
          </div>

          {success ? (
            <div className="flex items-center justify-center p-6 h-48">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Booking Added Successfully!
              </div>
              <p className="text-center">Redirecting to bookings list...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={isLoading}
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="test@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="0712345678"
                  required
                  disabled={isLoading}
                  pattern="^\d{10}$"
                  title="Phone number must be in the format 0712345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <input type="hidden" name="state" value={formData.state} />

              <Button type="submit" className="w-full bg-[#FF9800] hover:bg-[#F57C00] text-white" disabled={isLoading}>
                {isLoading ? "Creating..." : "Book Now"}
              </Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
