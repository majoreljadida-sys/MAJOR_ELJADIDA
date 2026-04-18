// ============================================================
// Types globaux — Club MAJOR
// ============================================================
import type { DefaultSession } from 'next-auth'

// ── Extension de la session NextAuth ─────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id:        string
      role:      string
      profileId: string | null
    } & DefaultSession['user']
  }
}

// ── API Responses ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?:    T
  error?:   string
  message?: string
}

// ── Pagination ────────────────────────────────────────────────
export interface PaginationMeta {
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data:       T[]
  pagination: PaginationMeta
}

// ── Dashboard Stats ────────────────────────────────────────────
export interface DashboardStats {
  totalMembers:     number
  activeMembers:    number
  expiredMembers:   number
  pendingMembers:   number
  upcomingEvents:   number
  pendingPayments:  number
  latePayments:     number
  totalRevenue:     number
  monthlyRevenue:   number
  upcomingSessions: number
}

// ── Chatbot ───────────────────────────────────────────────────
export interface ChatMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  timestamp: Date
}

export interface ChatbotRequest {
  message:   string
  sessionId: string
  userId?:   string
}

export interface ChatbotResponse {
  response:  string
  sessionId: string
}

// ── Blog ──────────────────────────────────────────────────────
export interface BlogPostWithCategory {
  id:          string
  title:       string
  slug:        string
  excerpt:     string
  coverImage:  string | null
  readTime:    number | null
  views:       number
  publishedAt: Date | null
  tags:        string[]
  category: {
    name:  string
    slug:  string
    color: string | null
  } | null
}

// ── Entraînement ──────────────────────────────────────────────
export interface TrainingSessionWithDetails {
  id:       string
  title:    string
  date:     Date
  location: string
  type:     string
  duration: number | null
  distance: number | null
  status:   string
  coach: {
    firstName: string
    lastName:  string
  } | null
  group: {
    name: string
  } | null
  _count: {
    attendances: number
  }
}

// ── Membre complet ────────────────────────────────────────────
export interface MemberWithUser {
  id:            string
  firstName:     string
  lastName:      string
  phone:         string | null
  photo:         string | null
  status:        string
  category:      string | null
  licenseNumber: string | null
  tshirtSize:    string | null
  createdAt:     Date
  user: {
    email: string
    role:  string
  }
  group: {
    name: string
  } | null
  _count: {
    payments:      number
    registrations: number
    attendances:   number
  }
}
