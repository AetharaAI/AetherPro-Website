import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  tier: 'guest', // 'guest', 'free', or 'pro'

  login: (userData, token) =>
    set(() => ({
      user: userData,
      token,
      isLoggedIn: true,
      tier: userData?.tier || 'free',
    })),

  logout: () =>
    set(() => ({
      user: null,
      token: null,
      isLoggedIn: false,
      tier: 'guest',
    })),

  setTier: (tier) =>
    set(() => ({
      tier,
    })),

  // Optional: persist login state in localStorage
  initializeAuth: () => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      const { user, token, tier } = JSON.parse(saved)
      set(() => ({
        user,
        token,
        isLoggedIn: true,
        tier,
      }))
    }
  },

  saveAuthToLocalStorage: () => {
    set((state) => {
      if (state.isLoggedIn) {
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          token: state.token,
          tier: state.tier
        }))
      } else {
        localStorage.removeItem('auth')
      }
      return {}
    })
  },
}))

export default useAuthStore