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
import { fetchHotels, syncLocalHotels } from "@/utils/api/hotels-api"
import type { Hotel } from "@/utils/types/hotels-type"
import { AlertCircle, Loader2, Plus, Search, Star } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"
import { isOnline, updateServerStatus } from "@/utils/api/health-reporting-api"

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function HotelsOverview() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [serverDown, setServerDown] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    address: "",
    minRating: "",
    maxRating: "",
  })

  // Infinite scroll pagination state
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const loader = useRef<HTMLDivElement>(null)
  const ITEMS_LIMIT = 10
  const initialLoadDone = useRef(false)

  // Function to load paginated hotels (reset if needed)
  const loadHotels = useCallback(
    async (reset = false) => {
      // Prevent multiple simultaneous loading requests
      if (isLoading) return

      try {
        setIsLoading(true)
        const currentOffset = reset ? 0 : offset
        const data = await fetchHotels(currentOffset, ITEMS_LIMIT)

        if (reset) {
          setHotels(data.results)
          setOffset(data.next_offset !== null ? data.next_offset : 0)
        } else {
          setHotels((prev) => {
            const combined = [...prev, ...data.results]
            // Remove duplicates based on hotel.id
            const uniqueHotels = combined.reduce<Hotel[]>((acc, hotel) => {
              if (!acc.some((h) => h.id === hotel.id)) {
                acc.push(hotel)
              }
              return acc
            }, [])
            return uniqueHotels
          })
          if (data.next_offset !== null) {
            setOffset(data.next_offset)
          }
        }

        setHasMore(data.next_offset !== null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hotels")
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, offset],
  )

  // Initial data load
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadHotels(true)
      initialLoadDone.current = true
    }
  }, [loadHotels])

  // Listen for server status changes and sync when back online
  useEffect(() => {
    const handleServerChange = async (event: CustomEvent) => {
      const isServerDown = event.detail.serverDown
      const wasServerDown = serverDown
      setServerDown(isServerDown)

      if (wasServerDown && !isServerDown) {
        console.log("Server is back online. Reloading data...")
        try {
          await syncLocalHotels()
          await loadHotels(true)
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
  }, [serverDown, loadHotels])

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

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoading) return

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadHotels()
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
  }, [hasMore, isLoading, loadHotels])

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSearching) return

    setIsSearching(true)
    setError(null)

    try {
      // First, fetch fresh data from the API without modifying our state yet
      const response = await fetchHotels(0, ITEMS_LIMIT)
      const freshHotels = response.results

      // If no filters are applied, just use the fresh data
      if (!filters.name && !filters.address && !filters.minRating && !filters.maxRating) {
        setHotels(freshHotels)
        setOffset(response.next_offset !== null ? response.next_offset : 0)
        setHasMore(response.next_offset !== null)
        setIsSearching(false)
        return
      }

      // Apply filters to the fresh data
      const filteredHotels = freshHotels.filter((hotel) => {
        const nameMatch = !filters.name || hotel.name.toLowerCase().includes(filters.name.toLowerCase())
        const addressMatch = !filters.address || hotel.address.toLowerCase().includes(filters.address.toLowerCase())
        const minRatingMatch = !filters.minRating || hotel.rating >= Number.parseFloat(filters.minRating)
        const maxRatingMatch = !filters.maxRating || hotel.rating <= Number.parseFloat(filters.maxRating)

        return nameMatch && addressMatch && minRatingMatch && maxRatingMatch
      })

      // Update state with filtered results
      setHotels(filteredHotels)
      setHasMore(false) // Disable infinite scroll for search results
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setFilters({ name: "", address: "", minRating: "", maxRating: "" })
    // Reset search results and go back to normal pagination
    if (!isLoading && !isSearching) {
      loadHotels(true)
    }
  }

  // Helper function to render stars based on rating
  const renderRatingStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />,
      )
    }
    return <div className="flex">{stars}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-col flex-1 container mx-auto py-8 px-4">
        {/* Header with Add Hotel button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hotels</h1>
          <Link href="/hotels/create">
            <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
              <Plus className="mr-2 h-4 w-4" />
              Add Hotel
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
                    placeholder="Search by hotel name"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
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
                      <label htmlFor="address" className="text-sm font-medium block mb-1">
                        Address
                      </label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Hotel address"
                        value={filters.address}
                        onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                        disabled={isSearching}
                      />
                    </div>
                    <div>
                      <label htmlFor="minRating" className="text-sm font-medium block mb-1">
                        Min Rating
                      </label>
                      <Input
                        id="minRating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="Minimum rating"
                        value={filters.minRating}
                        onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                        disabled={isSearching}
                      />
                    </div>
                    <div>
                      <label htmlFor="maxRating" className="text-sm font-medium block mb-1">
                        Max Rating
                      </label>
                      <Input
                        id="maxRating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="Maximum rating"
                        value={filters.maxRating}
                        onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
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
        {isLoading && hotels.length === 0 && (
          <div className="container mx-auto py-8 px-4 flex justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading hotels...</span>
            </div>
          </div>
        )}

        {/* Hotels List */}
        <div className="space-y-4">
          {hotels.length === 0 && !isLoading ? (
            <p className="text-center py-8 text-muted-foreground">No hotels found.</p>
          ) : (
            hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-[#E3F2FD]">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{hotel.name}</span>
                    <Link href={`/hotels/${hotel.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-1">
                    <p>
                      <span className="font-semibold">Address:</span> {hotel.address}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Rating:</span>
                      {renderRatingStars(hotel.rating)}
                      <span className="text-sm text-muted-foreground">({hotel.rating})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Loader for infinite scroll */}
        {hasMore && !isSearching && (
          <div ref={loader} className="flex justify-center py-4">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="h-10"></div>}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
