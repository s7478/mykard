import { create } from 'zustand'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string | null
  profileImage?: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: {
    fullName: string
    email: string
    phone?: string
    password: string
  }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      console.log('🔄 useAuth: Sending login request...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent/received
        body: JSON.stringify({ email, password }),
      })
      
      console.log('📡 useAuth: Response status:', response.status)
      let data: any = null
      try {
        data = await response.json()
      } catch {
        const text = await response.text()
        data = { error: text }
      }
      
      console.log('📦 useAuth: Response data:', data)
      
      if (!response.ok) {
        console.error('❌ useAuth: Login failed with error:', data.error)
        throw new Error(data.error || 'Login failed')
      }
      
      console.log('✅ useAuth: Setting user state:', data.user)
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      console.log('✅ useAuth: Login completed successfully')
    } catch (error) {
      console.error('❌ useAuth: Login exception:', error)
      set({ isLoading: false })
      throw error
    }
  },

  signup: async (userData) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Signup failed:', error)
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
      })
      
      set({
        user: null,
        isAuthenticated: false,
      })


      window.location.href = '/auth/login'


    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear local state even if API call fails
      set({ user: null, isAuthenticated: false })
      window.location.href = '/auth/login'
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include' // Ensure cookies are sent
      })
      
      if (response.ok) {
        let data: any = null
        try {
          data = await response.json()
        } catch {
          const text = await response.text()
          console.error('Unexpected non-JSON from /api/user/me:', text)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        // 401 is expected when not authenticated - don't log as error
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      // Only log unexpected errors, not auth failures
      if (error instanceof Error && !error.message.includes('401')) {
        console.error('Check auth failed:', error)
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))