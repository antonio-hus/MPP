"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRooms, syncLocalRooms, searchRooms } from "@/utils/api/rooms-api"
import { fetchHotels } from "@/utils/api/hotels-api"
import type { Room } from "@/utils/types/rooms-type"
import type { Hotel } from "@/utils/types/hotels-type"
import { AlertCircle, Loader2, Plus, Search, Users, DollarSign, BedDouble } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function RoomsOverview() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [serverDown, setServerDown] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [filters, setFilters] = useState({
    roomNumber: "",
    hotelId: "all",          // default to 'all'
    minCapacity: "",
    maxPrice: "",
  })

  // Infinite scroll pagination state
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const loader = useRef<HTMLDivElement>(null)
  const ITEMS_LIMIT = 10
  const initialLoadDone = useRef(false)

  // Function to load paginated rooms (reset if needed)
  const loadRooms = useCallback(
    async (reset = false) => {
      if (isLoading) return

      try {
        setIsLoading(true)
        const currentOffset = reset ? 0 : offset
        const data = await fetchRooms(currentOffset, ITEMS_LIMIT)

        if (reset) {
          setRooms(data.results)
          setOffset(data.next_offset !== null ? data.next_offset : 0)
        } else {
          setRooms((prev) => {
            const combined = [...prev, ...data.results]
            const uniqueRooms = combined.reduce<Room[]>((acc, room) => {
              if (!acc.some((r) => r.id === room.id)) {
                acc.push(room)
              }
              return acc
            }, [])
            return uniqueRooms
          })
          if (data.next_offset !== null) {
            setOffset(data.next_offset)
          }
        }

        setHasMore(data.next_offset !== null)
        setError(null)

        if (reset) {
          setIsSearchMode(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load rooms")
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, offset],
  )

  // Load hotels for filtering
  const loadHotels = useCallback(async () => {
    try {
      const data = await fetchHotels(0, 100)
      setHotels(data.results)
    } catch (err) {
      console.error("Failed to load hotels for filtering:", err)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadRooms(true)
      loadHotels()
      initialLoadDone.current = true
    }
  }, [loadRooms, loadHotels])

  // Listen for server status changes and sync when back online
  useEffect(() => {
    const handleServerChange = async (event: CustomEvent) => {
      const isServerDown = event.detail.serverDown
      const wasServerDown = serverDown
      setServerDown(isServerDown)

      if (wasServerDown && !isServerDown) {
        console.log("Server is back online. Reloading data...")
        try {
          await syncLocalRooms()

          if (isSearchMode) {
            await handleSearch(new Event('submit') as any)
          } else {
            await loadRooms(true)
          }
        } catch (err) {
          console.error("Error during sync and reload:", err)
          setError(err instanceof Error ? err.message : "Failed to sync and reload")
        }
      }
    }

    window.addEventListener("serverStatusChange", handleServerChange as EventListener)
    return () => {
      window.removeEventListener("serverStatusChange", handleServerChange as EventListener)
    }
  }, [serverDown, loadRooms, isSearchMode])

  useEffect(() => {
    const checkServer = async () => {
      const online = isOnline()
      updateServerStatus(!online)
      window.dispatchEvent(new CustomEvent("serverStatusChange", { detail: { serverDown: !online } }))
    }

    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [])

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoading || isSearchMode) return

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadRooms()
      }
    }

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.5 })

    if (loader.current) {
      observer.observe(loader.current)
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current)
      }
    }
  }, [hasMore, isLoading, loadRooms, isSearchMode])

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSearching) return

    setIsSearching(true)
    setError(null)

    if (
      !filters.roomNumber &&
      filters.hotelId === "all" &&
      !filters.minCapacity &&
      !filters.maxPrice
    ) {
      await loadRooms(true)
      setIsSearching(false)
      return
    }

    try {
      const payload = {
        roomNumber: filters.roomNumber || undefined,
        hotel: filters.hotelId === "all" ? undefined : filters.hotelId,
        minCapacity: filters.minCapacity || undefined,
        maxPrice: filters.maxPrice || undefined,
      }

      const searchResults = await searchRooms(payload)
      setRooms(searchResults)
      setHasMore(false)
      setIsSearchMode(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  // Reset handler
  const handleReset = () => {
    setFilters({ roomNumber: "", hotelId: "all", minCapacity: "", maxPrice: "" })

    if (!isLoading && !isSearching) {
      setOffset(0)
      setHasMore(true)
      setIsSearchMode(false)
      loadRooms(true)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-col flex-1 container mx-auto py-8 px-4">
        {/* Header with Add Room button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Link href="/rooms/create">
            <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </Link>
        </div>

        {/* Search Form */}
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by room number"
                    value={filters.roomNumber}
                    onChange={(e) => setFilters({ ...filters, roomNumber: e.target.value })}
                    disabled={isSearching}
                    className="w-full"
                  />
                </div>
                <Button className="bg-[#FF9800] hover:bg-[#F57C00]" type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <Collapsible open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch} className="w-full">
                <div className="flex justify-between items-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <span className="flex items-center text-sm text-muted-foreground">
                        {showAdvancedSearch ? "Hide Advanced Search" : "Show Advanced Search"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  {showAdvancedSearch && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={isSearching || isLoading}
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label htmlFor="hotelId" className="text-sm font-medium block mb-1">
                        Hotel
                      </label>
                      <Select
                        value={filters.hotelId}
                        onValueChange={(value) => setFilters({ ...filters, hotelId: value })}
                      >
                        <SelectTrigger id="hotelId" disabled={isSearching}>
                          <SelectValue placeholder="Select a hotel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Hotels</SelectItem>
                          {hotels.map((hotel) => (
                            <SelectItem key={hotel.id} value={hotel.id}>
                              {hotel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="minCapacity" className="text-sm font-medium block mb-1">
                        Min Capacity
                      </label>
                      <Input
                        id="minCapacity"
                        type="number"
                        min="1"
                        placeholder="Minimum capacity"
                        value={filters.minCapacity}
                        onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                        disabled={isSearching}
                      />
                    </div>
                    <div>
                      <label htmlFor="maxPrice" className="text-sm font-medium block mb-1">
                        Max Price per Night
                      </label>
                      <Input
                        id="maxPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Maximum price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        disabled={isSearching}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </form>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state indicator for first load */}
        {isLoading && rooms.length === 0 && (
          <div className="container mx-auto py-8 px-4 flex justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading rooms...</span>
            </div>
          </div>
        )}

        {/* Rooms List */}
        <div className="space-y-4">
          {rooms.length === 0 && !isLoading ? (
            <p className="text-center py-8 text-muted-foreground">No rooms found.</p>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-[#E3F2FD]">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>
                      Room {room.number} - {typeof room.hotel === 'string' ? 'Loading...' : room.hotel.name}
                    </span>
                    <Link href={`/rooms/${room.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Capacity: {room.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Price per night: {formatCurrency(room.price_per_night)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      <span>Hotel: {typeof room.hotel === 'string' ? 'Loading...' : room.hotel.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Loader for infinite scroll - only shown in non-search mode */}
        {hasMore && !isSearchMode && !isSearching && (
          <div ref={loader} className="flex justify-center py-4">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="h-10"></div>}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}