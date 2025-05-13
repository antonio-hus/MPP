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
import { fetchHotelById, updateHotelApi, deleteHotelApi } from "@/utils/api/hotels-api"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Hotel } from "@/utils/types/hotels-type"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function EditHotelPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // CONSTANTS SECTION //
  const resolvedParams = use(params)
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    rating: 0,
  })

  // HOOKS //
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await fetchHotelById(resolvedParams.id)
        setHotel(data)
        setFormData({
          name: data.name,
          address: data.address,
          rating: data.rating,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hotel")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHotel()
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
      [name]: name === "rating" ? Number.parseFloat(value) : value,
    }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hotel) return

    setIsSaving(true)
    setError(null)

    try {
      await updateHotelApi(hotel.id, formData)
      router.push("/hotels")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update hotel")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!hotel) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteHotelApi(hotel.id)
      setIsDeleteDialogOpen(false)
      router.push("/hotels")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete hotel")
      setIsDeleting(false)
    }
  }

  // JSX SECTION //
  /// PLACEHOLDER CONTENT ///
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NetworkStatusNotificationBar />
        <Header />
        <div className="flex-1 container mx-auto py-8 px-4 flex justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading hotel details...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  /// ERROR HANDLING CONTENT ///
  if (!hotel && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NetworkStatusNotificationBar />
        <Header />
        <div className="flex-1 container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Hotel not found</AlertDescription>
          </Alert>
          <Link href="/hotels">
            <Button className="mt-4">Back to Hotels</Button>
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
          <Link href="/hotels" className="text-center hover:underline">
            Cancel and Go Back
          </Link>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Hotel</h1>
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
              <Label htmlFor="name">Hotel Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
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
                disabled={isSaving || isDeleting}
              />
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
              <DialogTitle>Are you sure you want to delete this hotel?</DialogTitle>
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
