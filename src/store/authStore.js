// src/store/authStore.js
import { create } from 'zustand';
import { api } from '../services/api'; // Assuming you have api.js correctly configured

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  userToken: null,
  user: null, // Store user details if available
  authError: null,
  isLoading: false,

  // --- DUMMY LOGIN FOR DEVELOPMENT ---
  login: async (username, password) => {
    set({ isLoading: true, authError: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // Mock success:
      set({ 
        isAuthenticated: true, 
        userToken: 'mock-dev-token-123', 
        user: { username: username || 'devUser' },
        isLoading: false 
      });
      console.log("Dummy login successful!");
      return true; // Indicate success
      
      // --- Real API call would look something like this ---
      // const response = await api.post('/api/v1/auth/login', { username, password });
      // set({ 
      //   isAuthenticated: true, 
      //   userToken: response.access_token, // Adjust based on your API response
      //   user: response.user,
      //   isLoading: false 
      // });
      // return true;
      // --- End Real API call ---

    } catch (error) {
      console.error("Dummy login failed:", error);
      set({ isAuthenticated: false, userToken: null, user: null, authError: error.message || 'Login failed', isLoading: false });
      return false; // Indicate failure
    }
  },

  logout: () => {
    set({ isAuthenticated: false, userToken: null, user: null });
    console.log("Logged out.");
    // Optional: Redirect to login page after logout
    // if (typeof window !== 'undefined') {
    //   window.location.href = '/login'; 
    // }
  },

  // You might need a checkAuthStatus on app load for persistence
  checkAuthStatus: () => {
    // Check localStorage for token, validate it, etc.
    // For dummy, just set false
    set({ isAuthenticated: false, userToken: null });
  },
}));
export default useAuthStore;