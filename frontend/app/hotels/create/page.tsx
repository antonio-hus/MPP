"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createHotelApi } from "@/utils/api/hotels-api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function CreateHotelPage() {
  // CONSTANTS SECTION //
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    rating: 5,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // HANDLERS //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await createHotelApi(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/hotels")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkServer = async () => {
      const online = isOnline()
      updateServerStatus(!online)

      window.dispatchEvent(new CustomEvent("serverStatusChange", { detail: { serverDown: !online } }))
    }

    // Check every 5 seconds
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [])

  // JSX SECTION//
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6">
            <h1 className="text-2xl font-bold text-center">Add New Hotel</h1>
          </div>

          {success ? (
            <div className="flex items-center justify-center p-6 h-48">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Hotel Added Successfully!
              </div>
              <p className="text-center">Redirecting to hotels list...</p>
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
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hotel name"
                  required
                  disabled={isLoading}
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter hotel address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-[#FF9800] hover:bg-[#F57C00] text-white" disabled={isLoading}>
                {isLoading ? "Creating..." : "Add Hotel"}
              </Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
