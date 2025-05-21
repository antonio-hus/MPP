/////////////////////
// IMPORTS SECTION //
/////////////////////
import type {
  AuthResponse,
  LoginPayload,
  MonitoredUser,
  RegisterPayload,
  RegisterResponse,
  UserRole
} from "../types/users-type"
import {authFetch} from "@/utils/api/config-api";
import {OperationLog} from "@/utils/types/logs-type";

///////////////////////
// CONSTANTS SECTION //
///////////////////////
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (res.status === 500) {
    console.error('Server error status:', res.status);
    throw new Error('Server error occurred. Please try again or contact support.');
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    console.error('Failed to parse response:', err);
    throw new Error('Unable to process server response. Please try again.');
  }

  if (!res.ok) {
    if (body.password && body.password.length > 0) {
      throw new Error(`Password error: ${body.password[0]}`);
    } else if (body.email && body.email.length > 0) {
      throw new Error(`Email error: ${body.email[0]}`);
    } else if (body.username && body.username.length > 0) {
      throw new Error(`Username error: ${body.username[0]}`);
    } else if (body.non_field_errors && body.non_field_errors.length > 0) {
      throw new Error(body.non_field_errors[0]);
    } else if (body.detail) {
      throw new Error(body.detail);
    } else if (body.error) {
      throw new Error(body.error);
    } else {
      throw new Error(res.statusText || 'Registration failed');
    }
  }

  return body;
}

export async function handleSignup(data: RegisterPayload) {
  try {
    const res = await register(data);
    return res.detail;
  } catch (err: any) {
    console.error("Registration failed:", err);
    throw new Error(err.message || "Registration failed. Please try again.");
  }
}

export async function verifyEmail(uid: string, token: string): Promise<string> {
  const res = await fetch(`${API_URL}/verify-email/?uid=${uid}&token=${token}`)
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error || res.statusText)
  }
  return body.detail
}


export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.non_field_errors?.[0] || body.detail || res.statusText)
  }
  return body
}


export async function handleLogin(data: LoginPayload) {
  try {
    const { token, userRole } = await login(data);
    localStorage.setItem("token", token);
    if (userRole) {
      localStorage.setItem("userRole", userRole);
    }
    return token;
  } catch (err: any) {
    const message = err.message?.toLowerCase() || "";

    if (message.includes("verification")) {
      throw new Error("Email not verified. Please check your inbox.");
    } else if (message.includes("invalid")) {
      throw new Error("Incorrect username or password.");
    } else {
      throw new Error("Login failed. Please try again.");
    }
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
