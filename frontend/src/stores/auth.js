import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setToken: (token) => set({ token }),

            setUser: (userData) => set({
                user: userData,
                isAuthenticated: !!userData
            }),

            login: (userData, token) => set({
                user: userData,
                token: token,
                isAuthenticated: true
            }),

            logout: () => {
                localStorage.removeItem('token')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                })
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)

export default useAuthStore;