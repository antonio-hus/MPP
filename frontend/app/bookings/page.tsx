"use client"

/////////////////////
// IMPORTS SECTION //
/////////////////////
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchBookings, searchBookings } from "@/utils/mocks/api_mock"
import type { Booking } from "@/utils/types"
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Pie, Bar, Line } from "react-chartjs-2"
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend,} from "chart.js"


///////////////////
// BOOKING CHART //
///////////////////
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

function BookingCharts() {
  const [bookings, setBookings] = useState<Booking[]>([])

  // Poll bookings every 5 seconds to simulate real-time updates
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBookings()
        setBookings(data)
      } catch (err) {
        console.error("Error fetching chart data", err)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Pie Chart: Booking State Distribution
  const stateCounts = bookings.reduce(
    (acc, b) => {
      acc[b.state] = (acc[b.state] || 0) + 1
      return acc
    },
    {} as { [key: string]: number }
  )
  const pieData = {
    labels: Object.keys(stateCounts),
    datasets: [
      {
        data: Object.values(stateCounts),
        backgroundColor: ["#FBBF24", "#34D399", "#F87171", "#60A5FA"],
      },
    ],
  }

  // Bar & Line Chart: Daily Booking Counts
  // Group bookings by startDate
  const dailyCounts: { [key: string]: number } = {}
  bookings.forEach((b) => {
    dailyCounts[b.startDate] = (dailyCounts[b.startDate] || 0) + 1
  })
  const sortedDates = Object.keys(dailyCounts).sort()
  const barData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Bookings per Day",
        data: sortedDates.map((date) => dailyCounts[date]),
        backgroundColor: "#60A5FA",
      },
    ],
  }
  const lineData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Bookings Trend",
        data: sortedDates.map((date) => dailyCounts[date]),
        borderColor: "#34D399",
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        fill: true,
      },
    ],
  }

  return (
    <div className="space-y-8 my-8">
      <h2 className="text-xl font-bold">Real-Time Booking Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking State Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={pieData} />
          </CardContent>
        </Card>
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings (Bar Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barData} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Bookings Trend (Line Chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={lineData} options={{ responsive: true }} />
        </CardContent>
      </Card>
    </div>
  )
}


///////////////////
// BOOKINGS PAGE //
///////////////////

export default function BookingsPage() {

  // CONSTANTS SECTION //
  // State for view toggle: "list" or "metrics"
  const [viewMode, setViewMode] = useState<"list" | "metrics">("list")

  // State for bookings and search/filter
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [filters, setFilters] = useState({name: "", email: "", phone: "", start_date: "", end_date: "", state: "",})

  // Statistics for key booking states
  const totalBookingsCount = bookings.length
  const pendingCount = bookings.filter((b) => b.state === "PENDING").length
  const confirmedCount = bookings.filter((b) => b.state === "CONFIRMED").length
  const cancelledCount = bookings.filter((b) => b.state === "CANCELLED").length
  const completedCount = bookings.filter((b) => b.state === "COMPLETED").length

  // Pagination state for list view
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(bookings.length / itemsPerPage)
  const currentBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // HOOKS SECTION //
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings()
        setBookings(data)
        setCurrentPage(1)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }
    loadBookings()
  }, [])


  // HANDLERS SECTION //
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    try {
      const results = await searchBookings(filters)
      setBookings(results)
      setCurrentPage(1) // Reset to first page when search results are updated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setFilters({name: "", email: "", phone: "", start_date: "", end_date: "", state: "",})
  }

  // HELPERS SECTION //
  const getStateBgColor = (state: string): string => {
    switch (state) {
      case "PENDING":
        return "bg-yellow-100"
      case "CONFIRMED":
        return "bg-green-100"
      case "CANCELLED":
        return "bg-red-100"
      case "COMPLETED":
        return "bg-blue-100"
      default:
        return "bg-gray-100"
    }
  }

  const getStateBadgeClasses = (state: string): string => {
    switch (state) {
      case "PENDING":
        return "bg-yellow-200 text-yellow-800"
      case "CONFIRMED":
        return "bg-green-200 text-green-800"
      case "CANCELLED":
        return "bg-red-200 text-red-800"
      case "COMPLETED":
        return "bg-blue-200 text-blue-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
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
        {/* View Toggle Switch */}
        <div className="mb-6 flex justify-center space-x-4">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button
            variant={viewMode === "metrics" ? "default" : "outline"}
            onClick={() => setViewMode("metrics")}
          >
            Metrics
          </Button>

        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Conditionally render based on viewMode */}
        {viewMode === "list" ? (
          <>
            {/* Statistics Section */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold">{totalBookingsCount}</p>
                <p>Total Bookings</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-xl font-bold">{pendingCount}</p>
                <p>Pending</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xl font-bold">{confirmedCount}</p>
                <p>Confirmed</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-xl font-bold">{cancelledCount}</p>
                <p>Cancelled</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold">{completedCount}</p>
                <p>Completed</p>
              </div>
            </div>

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
                          onChange={(e) =>
                            setFilters({ ...filters, name: e.target.value })
                          }
                          disabled={isSearching}
                          className="w-full"
                        />
                      </div>
                      <Button
                        className="bg-[#FF9800] hover:bg-[#F57C00]"
                        type="submit"
                        disabled={isSearching}
                      >
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
                    <Collapsible
                      open={showAdvancedSearch}
                      onOpenChange={setShowAdvancedSearch}
                      className="w-full"
                    >
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            disabled={isSearching}
                          >
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
                              onChange={(e) =>
                                setFilters({ ...filters, email: e.target.value })
                              }
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
                              placeholder="+40 (072) 123-4567"
                              value={filters.phone}
                              onChange={(e) =>
                                setFilters({ ...filters, phone: e.target.value })
                              }
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
                              onChange={(e) =>
                                setFilters({ ...filters, state: e.target.value })
                              }
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
                              onChange={(e) =>
                                setFilters({ ...filters, start_date: e.target.value })
                              }
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
                              onChange={(e) =>
                                setFilters({ ...filters, end_date: e.target.value })
                              }
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
              {currentBookings.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No bookings found.
                </p>
              ) : (
                currentBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardHeader className={`${getStateBgColor(booking.state)} py-3 px-4`}>
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
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStateBadgeClasses(
                            booking.state
                          )}`}>
                            {booking.state}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <BookingCharts />
        )}
      </div>
      <Footer />
    </div>
  )
}
