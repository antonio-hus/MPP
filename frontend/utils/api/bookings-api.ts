/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Booking } from "./../types/bookings-type"
import { updateServerStatus, updateNetworkStatus, isOnline } from "./health-reporting-api"
import {authFetch} from "@/utils/api/config-api";


///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = "http://localhost:8000"


//////////////////////////////
// IN‑MEMORY STORAGE SECTION //
//////////////////////////////
// Local bookings cache (for offline support)
let bookings: Booking[] = []

// In‑memory queue for pending CRUD operations
interface CreateOp {
  type: "create"
  booking: Omit<Booking, "id">
  tempId: string
}
interface UpdateOp {
  type: "update"
  id: string
  booking: Omit<Booking, "id">
}
interface DeleteOp {
  type: "delete"
  id: string
}
type PendingOperation = CreateOp | UpdateOp | DeleteOp
let pendingOps: PendingOperation[] = []


//////////////////////////////
// HELPER FUNCTIONS SECTION //
//////////////////////////////
// Generate a unique ID for offline bookings
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
}


// Sync pending operations when back online
export async function syncLocalOperations(): Promise<void> {
  if (!isOnline() || pendingOps.length === 0) return

  // Make a copy of all pending operations
  const opsToProcess = [...pendingOps]
  // Clear or keep track of successfully processed operations
  const successfulOps = new Set()

  for (const op of opsToProcess) {
    try {
      if (op.type === "create") {
        // Call the real API create endpoint
        const response = await authFetch(`${API_URL}/bookings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(op.booking),
        })

        if (!response.ok) {
          throw new Error(`Error creating booking: ${response.statusText}`)
        }

        const created: Booking = await response.json()
        // Replace temporary booking in local cache with the created one
        bookings = bookings.map(b => (b.id === op.tempId ? created : b))
        // Mark this operation as successfully processed
        successfulOps.add(op)

      } else if (op.type === "update") {
        const response = await authFetch(`${API_URL}/bookings/${op.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(op.booking),
        })

        if (!response.ok) {
          throw new Error(`Error updating booking: ${response.statusText}`)
        }

        const updated: Booking = await response.json()
        // Update local cache with updated booking
        bookings = bookings.map(b => (b.id === op.id ? updated : b))
        successfulOps.add(op)

      } else if (op.type === "delete") {
        const response = await authFetch(`${API_URL}/bookings/${op.id}/`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Error deleting booking: ${response.statusText}`)
        }

        // Remove from local cache
        bookings = bookings.filter(b => b.id !== op.id)
        successfulOps.add(op)
      }
    } catch (error) {
      console.log("Sync operation failed:", error)
      updateServerStatus(true)
    }
  }

  // Only after processing all operations, remove the successful ones from pendingOps
  pendingOps = pendingOps.filter(op => !successfulOps.has(op))
}


///////////////////////
// API CALLS SECTION //
///////////////////////
// Fetch all bookings
export async function fetchBookings(offset: number = 0, limit: number = 10): Promise<{ count: number; results: Booking[]; next_offset: number | null }> {
  if (isOnline()) {
    try {
      const response = await authFetch(`${API_URL}/bookings/?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        updateServerStatus(true);
        throw new Error(`Error fetching bookings: ${response.statusText}`);
      }
      updateServerStatus(false);
      const data = await response.json();

      // Update the local bookings list with the newly fetched data
      if (offset === 0) {
        // If we're starting fresh, replace the entire cache
        bookings = data.results;
      } else {
        // Otherwise, append and prevent duplicates
        const existingIds = new Set(bookings.map(b => b.id));
        data.results.forEach(booking => {
          if (!existingIds.has(booking.id)) {
            bookings.push(booking);
          }
        });
      }

      return data;
    } catch (error) {
      console.log("Error fetching from server, using local cache.", error);
      updateServerStatus(true);
      const results = bookings.slice(offset, offset + limit);
      return {
        count: bookings.length,
        results,
        next_offset: offset + results.length < bookings.length ? offset + limit : null
      };
    }
  } else {
    updateNetworkStatus();
    const results = bookings.slice(offset, offset + limit);
    return {
      count: bookings.length,
      results,
      next_offset: offset + results.length < bookings.length ? offset + limit : null
    };
  }
}

// Fetch a single booking by ID
export async function fetchBookingById(id: string): Promise<Booking> {
  if (isOnline()) {
    try {
      const response = await authFetch(`${API_URL}/bookings/${id}/`)
      if (!response.ok) {
        updateServerStatus(true)
        throw new Error(`Error fetching booking: ${response.statusText}`)
      }
      updateServerStatus(false)
      const booking: Booking = await response.json()
      // Update local cache
      const existingIndex = bookings.findIndex(b => b.id === id);
      if (existingIndex >= 0) {
        bookings[existingIndex] = booking;
      } else {
        bookings.push(booking);
      }
      return booking
    } catch (error) {
      console.log("Error fetching booking from server, searching local cache.", error)
      updateServerStatus(true)
      const booking = bookings.find(b => b.id === id)
      if (!booking) {
        throw new Error("Booking not found")
      }
      return booking
    }
  } else {
    updateNetworkStatus()
    // Offline: search local cache
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      throw new Error("Booking not found")
    }
    return booking
  }
}

// Create a new booking
export async function createBookingApi(booking: Omit<Booking, "id">): Promise<Booking> {
  if (isOnline()) {
    try {
      const response = await authFetch(`${API_URL}/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      })

      if (!response.ok) {
        updateServerStatus(true)
        throw new Error(`Error creating booking: ${response.statusText}`)
      }
      updateServerStatus(false)
      const created: Booking = await response.json()
      // Update local cache
      bookings.push(created)
      return created
    } catch (error) {
      console.log("Server error during create; storing operation locally.", error)
      updateServerStatus(true)
    }
  }
  // Offline or error: use offline mode
  const tempId = generateUniqueId()
  const offlineBooking: Booking = { ...booking, id: tempId }
  bookings.push(offlineBooking)
  pendingOps.push({ type: "create", booking, tempId })
  return offlineBooking
}

// Update an existing booking
export async function updateBookingApi(id: string, booking: Omit<Booking, "id">): Promise<Booking> {
  if (isOnline()) {
    try {
      const response = await authFetch(`${API_URL}/bookings/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      })

      if (!response.ok) {
        updateServerStatus(true)
        throw new Error(`Error updating booking: ${response.statusText}`)
      }
      updateServerStatus(false)
      const updated: Booking = await response.json()
      // Update local cache
      const index = bookings.findIndex(b => b.id === id);
      if (index !== -1) {
        bookings[index] = updated;
      }
      return updated
    } catch (error) {
      console.log("Server error during update; storing operation locally.", error)
      updateServerStatus(true)
    }
  }
  // Offline or error: update local cache and queue op
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = { ...booking, id };
  }
  pendingOps.push({ type: "update", id, booking })
  return { ...booking, id }
}

// Delete a booking
export async function deleteBookingApi(id: string): Promise<void> {
  if (isOnline()) {
    try {
      const response = await authFetch(`${API_URL}/bookings/${id}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        updateServerStatus(true)
        throw new Error(`Error deleting booking: ${response.statusText}`)
      }
      updateServerStatus(false)
      // Remove from local cache
      bookings = bookings.filter(b => b.id !== id)
      return
    } catch (error) {
      console.log("Server error during delete; storing operation locally.", error)
      updateServerStatus(true)
    }
  }
  // Offline or error: update local cache and queue op
  bookings = bookings.filter(b => b.id !== id)
  pendingOps.push({ type: "delete", id })
}


// Search bookings with proper backend filtering
export async function searchBookings(filters: {
  name?: string
  email?: string
  phone?: string
  start_date?: string
  end_date?: string
  state?: string
}): Promise<Booking[]> {
  if (isOnline()) {
    try {
      // Build proper query string that matches backend filter parameters
      const params = new URLSearchParams();

      // Map frontend filter names to backend parameter names
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.phone) params.append('phone', filters.phone);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.state) params.append('state', filters.state);

      const response = await authFetch(`${API_URL}/bookings/?${params.toString()}`);

      if (!response.ok) {
        updateServerStatus(true);
        throw new Error(`Error searching bookings: ${response.statusText}`);
      }

      updateServerStatus(false);
      const data = await response.json();

      return data.results;
    } catch (error) {
      console.log("Error searching server; falling back to local search.", error);
      updateServerStatus(true);
    }
  }

  // Offline or error: filter local bookings
  return bookings.filter(booking => {
    let matches = true;

    if (filters.name && !booking.customerName.toLowerCase().includes(filters.name.toLowerCase())) {
      matches = false;
    }
    if (filters.email && !booking.customerEmail.toLowerCase().includes(filters.email.toLowerCase())) {
      matches = false;
    }
    if (filters.phone && !booking.customerPhone.includes(filters.phone)) {
      matches = false;
    }
    if (filters.state && booking.state !== filters.state.toUpperCase()) {
      matches = false;
    }

    // Handle date filtering similar to backend
    if (filters.start_date && new Date(booking.startDate) < new Date(filters.start_date)) {
      matches = false;
    }
    if (filters.end_date && new Date(booking.endDate) > new Date(filters.end_date)) {
      matches = false;
    }

    return matches;
  });
}