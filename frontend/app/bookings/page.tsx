"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchBookings, searchBookings } from "@/utils/api"
import type { Booking } from "@/utils/types"
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function BookingsPage() {

  // CONSTANTS SECTION //
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    start_date: "",
    end_date: "",
    state: "",
  })


  // HOOKS //
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings()
        setBookings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }
    loadBookings()
  }, [])


  // HANDLERS //
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    try {
      const results = await searchBookings(filters)
      setBookings(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  // Reset all filters
  const handleReset = () => {
    setFilters({
      name: "",
      email: "",
      phone: "",
      start_date: "",
      end_date: "",
      state: "",
    })
  }


  // JSX SECTION //
  /// PLACEHOLDER CONTENT ///
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading bookings...</span>
        </div>
      </div>
    )
  }

  /// ACTUAL CONTENT ///
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-col flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bookings List</h1>
          <Link href="/bookings/create">
            <Button className="bg-[#FF9800] hover:bg-[#F57C00]">New Booking</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch}>
              <div className="space-y-4">
                {/* Simple Search */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search by customer name"
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

                {/* Advanced Search Toggle */}
                <Collapsible open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch} className="w-full">
                  <div className="flex justify-between items-center">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <span className="flex items-center text-sm text-muted-foreground">
                          {showAdvancedSearch ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Hide Advanced Search
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Show Advanced Search
                            </>
                          )}
                        </span>
                      </Button>
                    </CollapsibleTrigger>

                    {showAdvancedSearch && (
                      <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isSearching}>
                        Reset Filters
                      </Button>
                    )}
                  </div>

                  <CollapsibleContent className="mt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label htmlFor="email" className="text-sm font-medium block mb-1">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="customer@example.com"
                          value={filters.email}
                          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                          disabled={isSearching}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="text-sm font-medium block mb-1">
                          Phone
                        </label>
                        <Input
                          id="phone"
                          type="text"
                          placeholder="+1 (555) 123-4567"
                          value={filters.phone}
                          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                          disabled={isSearching}
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="text-sm font-medium block mb-1">
                          Booking State
                        </label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="PENDING, CONFIRMED, etc."
                          value={filters.state}
                          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                          disabled={isSearching}
                        />
                      </div>

                      <div>
                        <label htmlFor="start_date" className="text-sm font-medium block mb-1">
                          Start Date
                        </label>
                        <Input
                          id="start_date"
                          type="date"
                          value={filters.start_date}
                          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                          disabled={isSearching}
                        />
                      </div>

                      <div>
                        <label htmlFor="end_date" className="text-sm font-medium block mb-1">
                          End Date
                        </label>
                        <Input
                          id="end_date"
                          type="date"
                          value={filters.end_date}
                          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                          disabled={isSearching}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bookings found.</p>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-muted py-3 px-4">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{booking.customerName}</span>
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-1">
                    <p>
                      <span className="font-semibold">Email:</span> {booking.customerEmail}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {booking.customerPhone}
                    </p>
                    <p>
                      <span className="font-semibold">Start Date:</span> {booking.startDate}
                    </p>
                    <p>
                      <span className="font-semibold">End Date:</span> {booking.endDate}
                    </p>
                    <p>
                      <span className="font-semibold">State:</span>{" "}
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {booking.state}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

