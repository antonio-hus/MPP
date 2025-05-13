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
import { createRoomApi } from "@/utils/api/rooms-api"
import { fetchHotels } from "@/utils/api/hotels-api"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hotel } from "@/utils/types/hotels-type"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function CreateRoomPage() {
  // CONSTANTS SECTION //
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [formData, setFormData] = useState({
    number: 0,
    capacity: 2,
    price_per_night: 100,
    hotel: { id: "", name: "", address: "", rating: 0 },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load hotels for selection
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await fetchHotels(0, 100) // Get all hotels
        setHotels(data.results)

        // Set the first hotel as default if available
        if (data.results.length > 0) {
          setFormData((prev) => ({
            ...prev,
            hotel: data.results[0],
          }))
        }
      } catch (err) {
        console.error("Failed to load hotels:", err)
        setError("Failed to load hotels. Please try again.")
      } finally {
        setIsLoadingHotels(false)
      }
    }

    loadHotels()
  }, [])

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

  // HANDLERS //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["number", "capacity", "price_per_night"].includes(name) ? Number.parseFloat(value) : value,
    }))
  }

  const handleHotelChange = (hotelId: string) => {
    const selectedHotel = hotels.find((h) => h.id === hotelId)
    if (selectedHotel) {
      setFormData((prev) => ({
        ...prev,
        hotel: selectedHotel,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.hotel.id) {
      setError("Please select a hotel")
      setIsLoading(false)
      return
    }

    try {
      const roomData = {
        number: formData.number,
        capacity: formData.capacity,
        price_per_night: formData.price_per_night,
        hotel: formData.hotel.id,
      }

      await createRoomApi(roomData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/rooms")
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
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6">
            <h1 className="text-2xl font-bold text-center">Add New Room</h1>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center p-6 h-48">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Room Added Successfully!
              </div>
              <p className="text-center">Redirecting to rooms list...</p>
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
                <Label htmlFor="number">Room Number</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Enter room number"
                  required
                  disabled={isLoading || isLoadingHotels}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (guests)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Enter room capacity"
                  required
                  disabled={isLoading || isLoadingHotels}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night ($)</Label>
                <Input
                  id="price_per_night"
                  name="price_per_night"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  placeholder="Enter price per night"
                  required
                  disabled={isLoading || isLoadingHotels}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel">Hotel</Label>
                {isLoadingHotels ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading hotels...</span>
                  </div>
                ) : (
                  <Select value={formData.hotel.id} onValueChange={handleHotelChange} disabled={isLoading}>
                    <SelectTrigger id="hotel">
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF9800] hover:bg-[#F57C00] text-white"
                disabled={isLoading || isLoadingHotels}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Room"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}