"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/api"
import { saveToken, getToken, removeToken, saveUser, getUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getToken()
    const existingUser = getUser()

    if (existingToken && existingUser) {
      setToken(existingToken)
      setUser(existingUser)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    saveToken(newToken)
    saveUser(newUser)
    setToken(newToken)
    setUser(newUser)

    // Redirect based on role
    if (newUser.role === "admin") {
      router.push("/admin")
    } else if (newUser.role === "provider") {
      router.push("/provider")
    } else {
      router.push("/")
    }
  }

  const logout = () => {
    removeToken()
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
