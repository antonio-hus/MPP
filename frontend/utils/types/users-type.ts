export type UserRole = 'user' | 'admin'

export interface BookingUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
}

export interface MonitoredUser {
  user: number
  username: string
  flagged_at: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  role: 'user' | 'admin'
}

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  userRole: string
}

export interface RegisterResponse {
  detail: string
}