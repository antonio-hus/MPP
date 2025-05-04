/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Hotel } from "./../types/hotels-type"
import { updateServerStatus, updateNetworkStatus, isOnline } from "./health-reporting-api"
import {authFetch} from "@/utils/api/config-api";

///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = "http://localhost:8000"

//////////////////////////////
// IN‑MEMORY STORAGE SECTION //
//////////////////////////////
let hotels: Hotel[] = []
interface CreateHotelOp { type: "create"; item: Omit<Hotel, "id">; tempId: string }
interface UpdateHotelOp { type: "update"; id: string; item: Omit<Hotel, "id"> }
interface DeleteHotelOp { type: "delete"; id: string }
let pendingHotelOps: (CreateHotelOp | UpdateHotelOp | DeleteHotelOp)[] = []

// Generate a unique ID for offline-created hotels
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Sync pending hotel ops when back online
export async function syncLocalHotels(): Promise<void> {
  if (!isOnline() || pendingHotelOps.length === 0) return
  const ops = [...pendingHotelOps]
  const succeeded = new Set<typeof ops[0]>()

  for (const op of ops) {
    try {
      if (op.type === "create") {
        const res = await authFetch(`${API_URL}/hotels/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.item),
        })
        if (!res.ok) throw new Error(res.statusText)
        const created: Hotel = await res.json()
        hotels = hotels.map(h => (h.id === op.tempId ? created : h))
        succeeded.add(op)

      } else if (op.type === "update") {
        const res = await authFetch(`${API_URL}/hotels/${op.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.item),
        })
        if (!res.ok) throw new Error(res.statusText)
        const updated: Hotel = await res.json()
        hotels = hotels.map(h => (h.id === op.id ? updated : h))
        succeeded.add(op)

      } else {
        const res = await authFetch(`${API_URL}/hotels/${op.id}/`, { method: "DELETE" })
        if (!res.ok) throw new Error(res.statusText)
        hotels = hotels.filter(h => h.id !== op.id)
        succeeded.add(op)
      }
    } catch {
      updateServerStatus(true)
    }
  }

  pendingHotelOps = pendingHotelOps.filter(op => !succeeded.has(op))
}

///////////////////////
// API CALLS SECTION //
///////////////////////
export async function fetchHotels(offset = 0, limit = 10) {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/hotels/?offset=${offset}&limit=${limit}`)
      if (!res.ok) { updateServerStatus(true); throw new Error(res.statusText) }
      updateServerStatus(false)
      const data = await res.json()
      hotels = offset === 0 ? data.results : [...hotels, ...data.results.filter((h: Hotel) => !hotels.find(x => x.id === h.id))]
      return data
    } catch {
      updateServerStatus(true)
    }
  } else updateNetworkStatus()

  const results = hotels.slice(offset, offset + limit)
  return { count: hotels.length, results, next_offset: offset + results.length < hotels.length ? offset + limit : null }
}

export async function fetchHotelById(id: string): Promise<Hotel> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/hotels/${id}/`)
      if (!res.ok) { updateServerStatus(true); throw new Error(res.statusText) }
      updateServerStatus(false)
      const hotel: Hotel = await res.json()
      const idx = hotels.findIndex(h => h.id === id)
      if (idx >= 0) hotels[idx] = hotel
      else hotels.push(hotel)
      return hotel
    } catch {
      updateServerStatus(true)
    }
  } else updateNetworkStatus()

  const local = hotels.find(h => h.id === id)
  if (!local) throw new Error("Hotel not found")
  return local
}

export async function createHotelApi(hotel: Omit<Hotel, "id">): Promise<Hotel> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/hotels/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hotel) })
      if (!res.ok) { updateServerStatus(true); throw new Error(res.statusText) }
      updateServerStatus(false)
      const created: Hotel = await res.json()
      hotels.push(created)
      return created
    } catch {
      updateServerStatus(true)
    }
  }

  const tempId = generateUniqueId()
  const offline = { ...hotel, id: tempId }
  hotels.push(offline)
  pendingHotelOps.push({ type: "create", item: hotel, tempId })
  return offline
}

export async function updateHotelApi(id: string, hotel: Omit<Hotel, "id">): Promise<Hotel> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/hotels/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hotel) })
      if (!res.ok) { updateServerStatus(true); throw new Error(res.statusText) }
      updateServerStatus(false)
      const updated: Hotel = await res.json()
      hotels = hotels.map(h => (h.id === id ? updated : h))
      return updated
    } catch {
      updateServerStatus(true)
    }
  }

  hotels = hotels.map(h => (h.id === id ? { ...hotel, id } : h))
  pendingHotelOps.push({ type: "update", id, item: hotel })
  return { ...hotel, id }
}

export async function deleteHotelApi(id: string): Promise<void> {
  if (isOnline()) {
    try {
      const res = await authFetch(`${API_URL}/hotels/${id}/`, { method: "DELETE" })
      if (!res.ok) { updateServerStatus(true); throw new Error(res.statusText) }
      updateServerStatus(false)
      hotels = hotels.filter(h => h.id !== id)
      return
    } catch {
      updateServerStatus(true)
    }
  }

  hotels = hotels.filter(h => h.id !== id)
  pendingHotelOps.push({ type: "delete", id })
}