"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import type React from "react"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchRoomById, updateRoomApi, deleteRoomApi } from "@/utils/api/rooms-api"
import { fetchHotels } from "@/utils/api/hotels-api"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Room } from "@/utils/types/rooms-type"
import type { Hotel } from "@/utils/types/hotels-type"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function EditRoomPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // CONSTANTS SECTION //
  const resolvedParams = use(params)
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    number: 0,
    capacity: 0,
    price_per_night: 0,
    hotel: { id: "", name: "", address: "", rating: 0 },
  })

  // HOOKS //
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await fetchRoomById(resolvedParams.id)
        setRoom(data)
        setFormData({
          number: data.number,
          capacity: data.capacity,
          price_per_night: data.price_per_night,
          hotel: data.hotel,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchAvailableHotels = async () => {
      try {
        const data = await fetchHotels(0, 100) // Get all hotels
        setHotels(data.results)
      } catch (err) {
        console.error("Failed to load hotels:", err)
      } finally {
        setIsLoadingHotels(false)
      }
    }

    fetchRoom()
    fetchAvailableHotels()
  }, [resolvedParams.id])

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return

    setIsSaving(true)
    setError(null)

    try {
      const roomData = {
        number: formData.number,
        capacity: formData.capacity,
        price_per_night: formData.price_per_night,
        hotel: formData.hotel,
      }

      await updateRoomApi(room.id, roomData)
      router.push("/rooms")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update room")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!room) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteRoomApi(room.id)
      setIsDeleteDialogOpen(false)
      router.push("/rooms")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room")
      setIsDeleting(false)
    }
  }

  // JSX SECTION //
  /// PLACEHOLDER CONTENT ///
  if (isLoading || isLoadingHotels) {
    return (
      <div className="flex flex-col min-h-screen">
        <NetworkStatusNotificationBar />
        <Header />
        <div className="flex-1 container mx-auto py-8 px-4 flex justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading room details...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  /// ERROR HANDLING CONTENT ///
  if (!room && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NetworkStatusNotificationBar />
        <Header />
        <div className="flex-1 container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Room not found</AlertDescription>
          </Alert>
          <Link href="/rooms">
            <Button className="mt-4">Back to Rooms</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  /// ACTUAL CONTENT ///
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-center mb-4">
          <Link href="/rooms" className="text-center hover:underline">
            Cancel and Go Back
          </Link>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Room</h1>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-4">
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
                required
                disabled={isSaving || isDeleting}
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
                required
                disabled={isSaving || isDeleting}
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
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel</Label>
              <Select value={formData.hotel.id} onValueChange={handleHotelChange} disabled={isSaving || isDeleting}>
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
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                disabled={isSaving || isDeleting}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isSaving || isDeleting}
              >
                Delete
              </Button>
            </div>
          </form>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete this room?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  )
}
