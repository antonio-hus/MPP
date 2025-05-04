"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBookings, searchBookings, syncLocalOperations } from "@/utils/api/bookings-api";
import type { Booking } from "@/utils/types/bookings-type";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar";
import useBookingUpdates from "@/utils/sockets/web-socket";
import {isOnline, updateServerStatus} from "@/utils/api/health-reporting-api";
import {syncLocalHotels} from "@/utils/api/hotels-api";
import {syncLocalRooms} from "@/utils/api/rooms-api";


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function BookingsOverview() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [serverDown, setServerDown] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    start_date: "",
    end_date: "",
    state: "",
  });

  // Infinite scroll pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement>(null);
  const ITEMS_LIMIT = 10;
  const initialLoadDone = useRef(false);

  // Stable callback for WebSocket updates
  const bookingUpdateHandler = useCallback((newBooking: Booking) => {
    setBookings((prevBookings) => {
      // Check if the booking already exists
      const exists = prevBookings.find((b) => b.id === newBooking.id);
      if (exists) {
        // Update the existing booking
        return prevBookings.map((b) => (b.id === newBooking.id ? newBooking : b));
      }
      // Add the new booking to the beginning of the list
      return [newBooking, ...prevBookings];
    });
  }, []);

  // Use the WebSocket hook with the stable callback
  // const { isConnected } = useBookingUpdates(bookingUpdateHandler);

  // Function to load paginated bookings (reset if needed)
  const loadBookings = useCallback(
    async (reset = false) => {
      // Prevent multiple simultaneous loading requests
      if (isLoading) return;

      try {
        setIsLoading(true);
        const currentOffset = reset ? 0 : offset;
        const data = await fetchBookings(currentOffset, ITEMS_LIMIT);

        if (reset) {
          setBookings(data.results);
          setOffset(data.next_offset !== null ? data.next_offset : 0);
        } else {
          setBookings((prev) => {
            const combined = [...prev, ...data.results];
            // Remove duplicates based on booking.id
            const uniqueBookings = combined.reduce<Booking[]>((acc, booking) => {
              if (!acc.some((b) => b.id === booking.id)) {
                acc.push(booking);
              }
              return acc;
            }, []);
            return uniqueBookings;
          });
          if (data.next_offset !== null) {
            setOffset(data.next_offset);
          }
        }

        setHasMore(data.next_offset !== null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, offset]
  );

  // Initial data load
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadBookings(true);
      initialLoadDone.current = true;
    }
  }, [loadBookings]);

  // Listen for server status changes and sync when back online
  useEffect(() => {
    const handleServerChange = async (event: CustomEvent) => {
      const isServerDown = event.detail.serverDown;
      const wasServerDown = serverDown;
      setServerDown(isServerDown);

      if (wasServerDown && !isServerDown) {
        console.log("Server is back online. Reloading data...");
        try {
          await syncLocalOperations();
          await syncLocalHotels();
          await syncLocalRooms();
          await loadBookings(true);
        } catch (err) {
          console.error("Error during sync and reload:", err);
          setError(err instanceof Error ? err.message : "Failed to sync and reload");
        }
      }
    };

    window.addEventListener("serverStatusChange", handleServerChange as EventListener);
    return () => {
      window.removeEventListener("serverStatusChange", handleServerChange as EventListener);
    };
  }, [serverDown, loadBookings]);

  useEffect(() => {
    const checkServer = async () => {
      const online = isOnline();
      updateServerStatus(!online);

      window.dispatchEvent(new CustomEvent("serverStatusChange", { detail: { serverDown: !online } }));
    };

    // Check every 5 seconds
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);


  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadBookings();
      }
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.5 });

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [hasMore, isLoading, loadBookings]);

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchBookings(filters);
      setBookings(results);
      setHasMore(false);
      setOffset(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFilters({ name: "", email: "", phone: "", start_date: "", end_date: "", state: "" });
    // Reset search results and go back to normal pagination
    if (!isLoading && !isSearching) {
      loadBookings(true);
    }
  };

  // Helper functions for booking state styles
  const getStateBgColor = (state: string): string => {
    switch (state) {
      case "PENDING":
        return "bg-yellow-100";
      case "CONFIRMED":
        return "bg-green-100";
      case "CANCELLED":
        return "bg-red-100";
      case "COMPLETED":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStateBadgeClasses = (state: string): string => {
    switch (state) {
      case "PENDING":
        return "bg-yellow-200 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-200 text-green-800";
      case "CANCELLED":
        return "bg-red-200 text-red-800";
      case "COMPLETED":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="flex-col flex-1 container mx-auto py-8 px-4">
        {/* Search Form */}
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="space-y-4">
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
                    <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isSearching || isLoading}>
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
                        placeholder="+40 (072) 123-4567"
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
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Loading state indicator for first load */}
        {isLoading && bookings.length === 0 && (
          <div className="container mx-auto py-8 px-4 flex justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading bookings...</span>
            </div>
          </div>
        )}
        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 && !isLoading ? (
            <p className="text-center py-8 text-muted-foreground">No bookings found.</p>
          ) : (
            bookings.map((booking) => (
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStateBadgeClasses(booking.state)}`}>
                        {booking.state}
                      </span>
                    </p>
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
  );
}