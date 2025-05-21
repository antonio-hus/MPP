/////////////////////
// IMPORTS SECTION //
/////////////////////


///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";


//////////////////////////////
// NETWORK/ SERVER STATUS  //
//////////////////////////////
export interface Status {
  networkDown: boolean
  serverDown: boolean
}

// Global status object the UI can use to display messages
export let status: Status = {
  networkDown: false,
  serverDown: false,
}

// Helper function to update network status
export function updateNetworkStatus(): void {
  status.networkDown = !navigator.onLine
  window.dispatchEvent(
    new CustomEvent("networkStatusChange", { detail: { networkDown: status.networkDown } })
  )
}

// Helper function to update server status
export function updateServerStatus(isDown: boolean): void {
  status.serverDown = isDown
  window.dispatchEvent(
    new CustomEvent("serverStatusChange", { detail: { serverDown: status.serverDown } })
  )
}

//////////////////////////////
// SERVER HEALTH CHECK CODE //
//////////////////////////////

// Basic online check using navigator.onLine
export function isOnline(): boolean {
  return window.navigator.onLine
}

// A helper function to ping the server.
export function checkServerStatus() {
  fetch(`${API_URL}/bookings/`, { method: "HEAD" })
    .then(response => {
      if (response.ok) {
        updateServerStatus(false)
      } else {
        updateServerStatus(true)
      }
    })
    .catch(error => {
      console.log("Server health check failed:", error)
      updateServerStatus(true)
    })
}