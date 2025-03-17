/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Booking } from "@/utils/types"


/////////////////////
// STORAGE SECTION //
/////////////////////
// In-memory storage for bookings
let bookings: Booking[] = []


////////////////////////////
// API MOCK CALLS SECTION //
////////////////////////////
// Reset the in-memory bookings (for testing purposes)
export function resetBookings(): void {
  bookings = [];
}


// Utility function to generate a unique ID (simple implementation)
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Data validation function for bookings
function validateBookingData(booking: Omit<Booking, "id">): void {
  const { customerName, customerEmail, customerPhone, startDate, endDate, state } = booking

  // Validate customerName
  if (!customerName || typeof customerName !== "string" || customerName.length > 127) {
    throw new Error("Invalid customerName: must be a non-empty string with max 127 characters")
  }

  // Validate customerEmail (basic check for "@" symbol)
  if (!customerEmail || typeof customerEmail !== "string" || customerEmail.length > 127 || !customerEmail.includes("@")) {
    throw new Error("Invalid customerEmail: must be a valid email address with max 127 characters")
  }

  // Validate customerPhone
  if (!customerPhone || typeof customerPhone !== "string" || customerPhone.length > 20) {
    throw new Error("Invalid customerPhone: must be a non-empty string with max 20 characters")
  }

  // Validate dates using regex for the YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!startDate || typeof startDate !== "string" || !dateRegex.test(startDate)) {
    throw new Error("Invalid startDate: must be a string in the format YYYY-MM-DD")
  }
  if (!endDate || typeof endDate !== "string" || !dateRegex.test(endDate)) {
    throw new Error("Invalid endDate: must be a string in the format YYYY-MM-DD")
  }

  // Ensure startDate is not after endDate
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (start > end) {
    throw new Error("Invalid dates: startDate cannot be after endDate")
  }

  // Validate state against allowed values
  const allowedStates = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
  if (!state || !allowedStates.includes(state)) {
    throw new Error(`Invalid state: must be one of ${allowedStates.join(", ")}`)
  }
}

// Fetch all bookings from memory
export async function fetchBookings(): Promise<Booking[]> {
  return bookings
}

// Fetch a single booking by ID from memory
export async function fetchBookingById(id: string): Promise<Booking> {
  const booking = bookings.find(b => b.id === id)
  if (!booking) {
    throw new Error("Booking not found")
  }
  return booking
}

// Create a new booking in memory
export async function createBookingApi(booking: Omit<Booking, "id">): Promise<Booking> {
  // Validate booking data before creation
  validateBookingData(booking)

  const newBooking: Booking = { ...booking, id: generateUniqueId() }
  bookings.push(newBooking)
  return newBooking
}

// Update an existing booking in memory
export async function updateBookingApi(id: string, booking: Omit<Booking, "id">): Promise<Booking> {
  const index = bookings.findIndex(b => b.id === id)
  if (index === -1) {
    throw new Error("Booking not found")
  }

  // Validate booking data before updating
  validateBookingData(booking)

  const updatedBooking: Booking = { ...booking, id }
  bookings[index] = updatedBooking
  return updatedBooking
}

// Delete a booking from memory
export async function deleteBookingApi(id: string): Promise<void> {
  bookings = bookings.filter(b => b.id !== id)
}

// Generic search function to filter bookings in memory
export async function searchBookings(filters: {
  name?: string
  email?: string
  phone?: string
  start_date?: string
  end_date?: string
  state?: string
}): Promise<Booking[]> {
  return bookings.filter(booking => {
    if (filters.name && !booking.customerName.toLowerCase().includes(filters.name.toLowerCase())) {
      return false
    }
    if (filters.email && !booking.customerEmail.toLowerCase().includes(filters.email.toLowerCase())) {
      return false
    }
    if (filters.phone && !booking.customerPhone.includes(filters.phone)) {
      return false
    }
    if (filters.start_date && booking.startDate !== filters.start_date) {
      return false
    }
    if (filters.end_date && booking.endDate !== filters.end_date) {
      return false
    }
    if (filters.state && booking.state !== filters.state) {
      return false
    }
    return true
  })
}
