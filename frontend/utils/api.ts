/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Booking } from "./types"


///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = "http://localhost:8000"


///////////////////////
// API CALLS SECTION //
///////////////////////
// Fetch all bookings
export async function fetchBookings(): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/bookings/`)
  if (!response.ok) {
    throw new Error(`Error fetching bookings: ${response.statusText}`)
  }
  return response.json()
}

// Fetch a single booking by ID
export async function fetchBookingById(id: string): Promise<Booking> {
  const response = await fetch(`${API_URL}/bookings/${id}/`)
  if (!response.ok) {
    throw new Error(`Error fetching booking: ${response.statusText}`)
  }
  return response.json()
}

// Create a new booking
export async function createBookingApi(booking: Omit<Booking, "id">): Promise<Booking> {
  const response = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    throw new Error(`Error creating booking: ${response.statusText}`)
  }

  return response.json()
}

// Update a booking
export async function updateBookingApi(id: string, booking: Omit<Booking, "id">): Promise<Booking> {
  const response = await fetch(`${API_URL}/bookings/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    throw new Error(`Error updating booking: ${response.statusText}`)
  }

  return response.json()
}

// Delete a booking
export async function deleteBookingApi(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/bookings/${id}/`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Error deleting booking: ${response.statusText}`)
  }
}

// Generic Search Bookings Function
export async function searchBookings(filters: {
  name?: string
  email?: string
  phone?: string
  start_date?: string
  end_date?: string
  state?: string
}): Promise<Booking[]> {
  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([, value]) => value && value.trim() !== "")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {} as Record<string, string>)
  ).toString()

  const response = await fetch(`${API_URL}/bookings/?${query}`)
  if (!response.ok) {
    throw new Error(`Error searching bookings: ${response.statusText}`)
  }
  return response.json()
}

