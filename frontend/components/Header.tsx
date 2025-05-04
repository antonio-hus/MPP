"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isAuthenticated, logout, getUserRole } from "@/utils/api/users-api"

export default function Header() {
  // Initialize with empty state
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userRole: "",
    isLoaded: false
  })

  // Only run auth checks after component mounts on client
  useEffect(() => {
    // This runs only on the client after hydration
    const loggedIn = isAuthenticated()
    const role = getUserRole()

    setAuthState({
      isLoggedIn: loggedIn,
      userRole: role,
      isLoaded: true
    })
  }, [])

  const handleLogout = () => {
    logout()
    // Update state immediately to reflect logout
    setAuthState({
      isLoggedIn: false,
      userRole: "",
      isLoaded: true
    })
  }

  // Use a completely static initial render until client hydration completes
  if (!authState.isLoaded) {
    return (
      <header className="bg-[#2196F3] text-white p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">
              BOOKNOW
            </div>
            <nav aria-hidden="true">
              <div className="h-6 w-32"></div>
            </nav>
          </div>
        </div>
      </header>
    )
  }

  // After hydration, render the full component
  const isAdmin = authState.userRole === "admin"

  return (
    <header className="bg-[#2196F3] text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            BOOKNOW
          </Link>
          <nav>
            <ul className="flex space-x-8 items-center">
              {authState.isLoggedIn ? (
                <>
                  {/* Admin Dashboard - Only visible to admins */}
                  {isAdmin && (
                    <li>
                      <Link href="/dashboard" className="flex items-center hover:underline">
                        <span>Dashboard</span>
                      </Link>
                    </li>
                  )}

                  {/* Bookings Category */}
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center hover:underline focus:outline-none">
                        <span>Bookings</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href="/bookings" className="w-full">
                            All Bookings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/bookings/create" className="w-full">
                            Create Booking
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/bookings/analytics" className="w-full">
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>

                  {/* Hotels Category */}
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center hover:underline focus:outline-none">
                        <span>Hotels</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href="/hotels" className="w-full">
                            All Hotels
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/hotels/create" className="w-full">
                            Create Hotel
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>

                  {/* Rooms Category */}
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center hover:underline focus:outline-none">
                        <span>Rooms</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href="/rooms" className="w-full">
                            All Rooms
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/rooms/create" className="w-full">
                            Create Room
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>

                  {/* Files Category */}
                  <li>
                    <Link href="/files" className="hover:underline">
                      Files
                    </Link>
                  </li>

                  {/* Logout Button */}
                  <li>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center text-white hover:bg-[#1976D2] hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="hover:underline">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="hover:underline">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}