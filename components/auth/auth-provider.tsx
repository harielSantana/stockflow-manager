"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { AuthState, LoginFormData, RegisterFormData, AuthResult } from "@/lib/types"
import {
  loginApi,
  logoutApi,
  registerApi,
  getMeApi,
  ApiError,
} from "@/lib/api"

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<AuthResult>
  logout: () => Promise<void>
  register: (data: RegisterFormData) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const user = await getMeApi()
        if (!cancelled) {
          setState({ user, isAuthenticated: true, isLoading: false })
        }
      } catch {
        if (!cancelled) {
          setState({ user: null, isAuthenticated: false, isLoading: false })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (data: LoginFormData): Promise<AuthResult> => {
    try {
      const { user } = await loginApi(data)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true, user }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Erro ao fazer login"
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const register = useCallback(
    async (data: RegisterFormData): Promise<AuthResult> => {
      if (data.password !== data.confirmPassword) {
        return { success: false, error: "As senhas nao coincidem" }
      }
      if (data.password.length < 6) {
        return { success: false, error: "A senha deve ter pelo menos 6 caracteres" }
      }
      try {
        const { user } = await registerApi({
          name: data.name,
          email: data.email,
          password: data.password,
        })
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return { success: true, user }
      } catch (e) {
        const message =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Erro ao cadastrar"
        return { success: false, error: message }
      }
    },
    []
  )

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
