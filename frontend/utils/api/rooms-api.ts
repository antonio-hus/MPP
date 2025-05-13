/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Room } from "./../types/rooms-type"
import { updateServerStatus, updateNetworkStatus, isOnline } from "./health-reporting-api"
import { fetchHotelById } from "./hotels-api"
import {authFetch} from "@/utils/api/config-api";

///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://backend-587575638625.europe-west1.run.app"


//////////////////////////////
// IN-MEMORY STORAGE SECTION //
//////////////////////////////
let rooms: Room[] = []
interface CreateRoomOp {
  type: "create"
  item: Omit<Room, "id">
  tempId: string
}
interface UpdateRoomOp {
  type: "update"
  id: string
  item: Omit<Room, "id">
}
interface DeleteRoomOp {
  type: "delete"
  id: string
}
let pendingRoomOps: (CreateRoomOp | UpdateRoomOp | DeleteRoomOp)[] = []

// Generate a unique ID for offline-created rooms
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Helper function to ensure rooms have complete hotel data
async function ensureCompleteHotelData(roomsToProcess: Room[]): Promise<Room[]> {
  const processedRooms: Room[] = []

  for (const room of roomsToProcess) {
    // Create a copy so we don't modify the original
    const roomCopy = { ...room }

    // Check if hotel is just an ID (string) and not an object
    if (roomCopy.hotel && typeof roomCopy.hotel === 'string') {
      try {
        const hotelData = await fetchHotelById(roomCopy.hotel)
        roomCopy.hotel = hotelData
      } catch (error) {
        console.error(`Failed to fetch hotel data for room ${roomCopy.id}:`, error)
        // Create a minimal hotel object if fetch fails
        roomCopy.hotel = {
          id: roomCopy.hotel,
          name: "Unknown Hotel",
          address: "",
          rating: 0
        }
      }
    }

    processedRooms.push(roomCopy)
  }

  return processedRooms
}

// Sync pending room ops when back online
export async function syncLocalRooms(): Promise<void> {
  if (!isOnline() || pendingRoomOps.length === 0) return
  const ops = [...pendingRoomOps]
  const succeeded = new Set<(typeof ops)[0]>()

  for (const op of ops) {
    try {
      if (op.type === "create") {
        const res = await authFetch(`${API_URL}/rooms/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.item),
        })
        if (!res.ok) throw new Error(res.statusText)
        const created: Room = await res.json()

        // Ensure created room has complete hotel data
        const processedRoom = (await ensureCompleteHotelData([created]))[0]

        rooms = rooms.map((r) => (r.id === op.tempId ? processedRoom : r))
        succeeded.add(op)
      } else if (op.type === "update") {
        const res = await authFetch(`${API_URL}/rooms/${op.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.item),
        })
        if (!res.ok) throw new Error(res.statusText)
        const updated: Room = await res.json()

        // Ensure updated room has complete hotel data
        const processedRoom = (await ensureCompleteHotelData([updated]))[0]

        rooms = rooms.map((r) => (r.id === op.id ? processedRoom : r))
        succeeded.add(op)
      } else {
        const res = await authFetch(`${API_URL}/rooms/${op.id}/`, { method: "DELETE" })
        if (!res.ok) throw new Error(res.statusText)
        rooms = rooms.filter((r) => r.id !== op.id)
        succeeded.add(op)
      }
    } catch {
      updateServerStatus(true)
    }
  }

  pendingRoomOps = pendingRoomOps.filter((op) => !succeeded.has(op))
}

///////////////////////
// API CALLS SECTION //
///////////////////////
// Fetch all rooms
export async function fetchRooms(
  offset = 0,
  limit = 10,
): Promise<{ count: number; results: Room[]; next_offset: number | null }> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/rooms/?offset=${offset}&limit=${limit}`)
      if (!res.ok) {
        updateServerStatus(true)
        throw new Error(res.statusText)
      }
      updateServerStatus(false)
      const data = await res.json()

      // Ensure each room has complete hotel data
      const processedResults = await ensureCompleteHotelData(data.results)

      if (offset === 0) {
        rooms = processedResults
      } else {
        // Merge new results, avoiding duplicates and ensuring they have complete hotel data
        rooms = [
          ...rooms,
          ...processedResults.filter((r: Room) => !rooms.find((x) => x.id === r.id))
        ]
      }

      return {
        count: data.count,
        results: processedResults,
        next_offset: data.next_offset
      }
    } catch (error) {
      updateServerStatus(true)
      throw error
    }
  } else {
    updateNetworkStatus()
  }

  const results = rooms.slice(offset, offset + limit)
  return {
    count: rooms.length,
    results,
    next_offset: offset + results.length < rooms.length ? offset + limit : null,
  }
}

// Fetch single room by ID
export async function fetchRoomById(id: string): Promise<Room> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/rooms/${id}/`)
      if (!res.ok) {
        updateServerStatus(true)
        throw new Error(res.statusText)
      }
      updateServerStatus(false)
      let room: Room = await res.json()

      // Ensure room has complete hotel data
      const processedRooms = await ensureCompleteHotelData([room])
      room = processedRooms[0]

      // Update the local cache
      const idx = rooms.findIndex((r) => r.id === id)
      if (idx >= 0) rooms[idx] = room
      else rooms.push(room)

      return room
    } catch (error) {
      updateServerStatus(true)
      throw error
    }
  } else {
    updateNetworkStatus()
  }

  const local = rooms.find((r) => r.id === id)
  if (!local) throw new Error("Room not found")

  // For offline mode, ensure we have complete hotel data
  if (local.hotel && typeof local.hotel === 'string') {
    try {
      const hotelData = await fetchHotelById(local.hotel)
      local.hotel = hotelData
    } catch (hotelError) {
      console.error(`Failed to fetch hotel data for room ${id} in offline mode:`, hotelError)
      // Create a minimal hotel object if fetch fails
      local.hotel = {
        id: local.hotel,
        name: "Offline Hotel",
        address: "",
        rating: 0
      }
    }
  }

  return local
}

// Create a new room
export async function createRoomApi(roomData: {
  number: number;
  capacity: number;
  price_per_night: number;
  hotel: string; // Expecting just the hotel ID
}): Promise<Room> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      })

      if (!res.ok) {
        updateServerStatus(true)
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || res.statusText || "Failed to create room");
      }

      updateServerStatus(false)
      let created: Room = await res.json()

      // Ensure created room has complete hotel data
      if (created.hotel && typeof created.hotel === 'string') {
        try {
          const hotelData = await fetchHotelById(created.hotel)
          created.hotel = hotelData
        } catch (hotelError) {
          console.error(`Failed to fetch hotel data for new room:`, hotelError)
          created.hotel = {
            id: created.hotel,
            name: "Unknown Hotel",
            address: "",
            rating: 0
          }
        }
      }

      rooms.push(created)
      return created
    } catch (error) {
      updateServerStatus(true)
      throw error;
    }
  }

  // For offline mode, fetch the hotel data to have the complete object
  let hotelObj;
  try {
    hotelObj = await fetchHotelById(roomData.hotel)
  } catch (hotelError) {
    console.error(`Failed to fetch hotel data for offline room creation:`, hotelError)
    hotelObj = {
      id: roomData.hotel,
      name: "Offline Hotel",
      address: "",
      rating: 0
    }
  }

  const tempId = generateUniqueId()
  const offline = {
    ...roomData,
    id: tempId,
    hotel: hotelObj
  } as unknown as Room;

  rooms.push(offline)
  pendingRoomOps.push({ type: "create", item: roomData, tempId })
  return offline
}

// Update a room
export async function updateRoomApi(id: string, room: Omit<Room, "id">): Promise<Room> {
  // For updates, ensure we're sending just the hotel ID if it's an object
  const updateData = {
    ...room,
    hotel: typeof room.hotel === 'object' ? room.hotel.id : room.hotel
  };

  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/rooms/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      if (!res.ok) {
        updateServerStatus(true)
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || res.statusText || "Failed to update room");
      }
      updateServerStatus(false)
      let updated: Room = await res.json()

      // Ensure updated room has complete hotel data
      if (updated.hotel && typeof updated.hotel === 'string') {
        try {
          const hotelData = await fetchHotelById(updated.hotel)
          updated.hotel = hotelData
        } catch (hotelError) {
          console.error(`Failed to fetch hotel data for updated room:`, hotelError)
          updated.hotel = {
            id: updated.hotel,
            name: "Unknown Hotel",
            address: "",
            rating: 0
          }
        }
      }

      rooms = rooms.map((r) => (r.id === id ? updated : r))
      return updated
    } catch (error) {
      updateServerStatus(true)
      throw error;
    }
  }

  // Get the hotel object for offline mode
  let hotelObj;
  if (typeof room.hotel === 'string') {
    try {
      hotelObj = await fetchHotelById(room.hotel)
    } catch (hotelError) {
      console.error(`Failed to fetch hotel data for offline room update:`, hotelError)
      hotelObj = {
        id: room.hotel,
        name: "Offline Hotel",
        address: "",
        rating: 0
      }
    }
  } else {
    hotelObj = room.hotel
  }

  const updatedRoom = { ...room, id, hotel: hotelObj }
  rooms = rooms.map((r) => (r.id === id ? updatedRoom : r))
  pendingRoomOps.push({ type: "update", id, item: updateData })
  return updatedRoom
}

// Delete a room
export async function deleteRoomApi(id: string): Promise<void> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/rooms/${id}/`, { method: "DELETE" })
      if (!res.ok) {
        updateServerStatus(true)
        throw new Error(res.statusText)
      }
      updateServerStatus(false)
      rooms = rooms.filter((r) => r.id !== id)
      return
    } catch {
      updateServerStatus(true)
    }
  }

  rooms = rooms.filter((r) => r.id !== id)
  pendingRoomOps.push({ type: "delete", id })
}

// Search rooms by hotel filter
export async function searchRooms(filters: {
  hotel?: string;
  roomNumber?: string;
  minCapacity?: string;
  maxPrice?: string;
}): Promise<Room[]> {
  // Always fetch fresh data from the server when online
  if (isOnline()) {
    try {
      // Build query parameters for all filters
      const params = new URLSearchParams()
      if (filters.hotel) params.append("hotel", filters.hotel)
      if (filters.roomNumber) params.append("number", filters.roomNumber)
      if (filters.minCapacity) params.append("min_capacity", filters.minCapacity)
      if (filters.maxPrice) params.append("max_price", filters.maxPrice)

      const res = await authFetch(`${API_URL}/rooms/?${params.toString()}`)
      if (!res.ok) {
        updateServerStatus(true)
        throw new Error(res.statusText)
      }
      updateServerStatus(false)
      const data = await res.json()

      // Ensure each room has complete hotel data
      const processedResults = await ensureCompleteHotelData(data.results)
      return processedResults
    } catch (error) {
      updateServerStatus(true)
      console.error("Error searching rooms:", error)
      // If server search fails, fall back to client-side filtering of cached data
    }
  }

  // For offline mode or if server search failed, filter the cached rooms
  // Start with ALL rooms we have in the cache
  let filteredRooms = [...rooms];

  // Apply filters one by one
  if (filters.roomNumber) {
    filteredRooms = filteredRooms.filter(room =>
      room.number.toString() === filters.roomNumber
    )
  }

  if (filters.hotel) {
    filteredRooms = filteredRooms.filter(room => {
      const roomHotelId = typeof room.hotel === 'string' ? room.hotel : room.hotel.id
      return roomHotelId === filters.hotel
    })
  }

  if (filters.minCapacity) {
    const minCapacity = parseInt(filters.minCapacity, 10)
    if (!isNaN(minCapacity)) {
      filteredRooms = filteredRooms.filter(room => room.capacity >= minCapacity)
    }
  }

  if (filters.maxPrice) {
    const maxPrice = parseFloat(filters.maxPrice)
    if (!isNaN(maxPrice)) {
      filteredRooms = filteredRooms.filter(room => room.price_per_night <= maxPrice)
    }
  }

  return filteredRooms
}