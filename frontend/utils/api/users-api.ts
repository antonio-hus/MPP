/////////////////////
// IMPORTS SECTION //
/////////////////////
import type {AuthResponse, LoginPayload, MonitoredUser, RegisterPayload, UserRole} from "../types/users-type"
import {authFetch} from "@/utils/api/config-api";
import {OperationLog} from "@/utils/types/logs-type";

///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://backend-587575638625.europe-west1.run.app"

///////////////////////
// API CALLS SECTION //
///////////////////////
export async function fetchMonitoredUsers(): Promise<MonitoredUser[]> {
  const res = await authFetch(`${API_URL}/monitored-users/`)
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.detail || res.statusText)
  }
  return res.json()
}

export async function fetchOperationLogs(): Promise<OperationLog[]> {
  const res = await authFetch(`${API_URL}/operation-logs/`)
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.detail || res.statusText)
  }
  return res.json()
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.password?.[0] || body.detail || res.statusText)
  }
  return res.json()
}

export async function handleSignup(data: RegisterPayload) {
  try {
    const { token, userRole } = await register(data)
    localStorage.setItem("token", token)
    localStorage.setItem("userRole", userRole)
    return token
  } catch (err: any) {
    console.error("Registration failed:", err.message)
    throw err
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.non_field_errors?.[0] || body.detail || res.statusText)
  }
  return res.json()
}

export async function handleLogin(data: LoginPayload) {
  try {
    const { token, userRole } = await login(data)
    localStorage.setItem("token", token)
    if (userRole ) {
      localStorage.setItem("userRole", userRole)
    }
    return token
  } catch (err: any) {
    console.error("Login failed:", err.message)
    throw err
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("token")
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  window.location.href = "/auth"
}

export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userRole") as UserRole | null
}
