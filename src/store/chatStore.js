// src/store/chatStore.js
import { create } from 'zustand';
import { submitPrompt } from '../services/api'; // Import your API function

const useChatStore = create((set, get) => ({
  messages: [], // Array of { id, text, sender: 'user' | 'aetherpro', type: 'merged' | 'error' | 'info', sources?: string[] }
  isLoading: false,
  error: null,
  currentSessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Simple unique session ID
  // Add selectedAgents state if you have an agent selector UI
  // selectedAgents: [], 
  // setSelectAgents: (agents) => set({ selectedAgents: agents }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, { id: Date.now(), ...message }] })),

  startNewSession: () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({ 
      messages: [{id: Date.now(), text: `New session started: ${newSessionId}`, sender: 'system', type: 'info'}], 
      currentSessionId: newSessionId,
      error: null 
    });
    console.log("New session started:", newSessionId);
  },

  sendPromptToAetherPro: async (promptText) => {
    if (!promptText.trim()) return;

    const userMessage = { text: promptText, sender: 'user', type: 'normal' };
    set((state) => ({ 
      messages: [...state.messages, {id: Date.now(), ...userMessage}],
      isLoading: true, 
      error: null 
    }));

    try {
      const currentSessionId = get().currentSessionId;
      // const selectedAgents = get().selectedAgents; // Get selected agents if feature is implemented

      // The API response should contain: { success: true, data: { request_id, session_id, merged_text, contributing_llms }}
      // Or { success: false, message: "error details" }
      const response = await submitPrompt(promptText, currentSessionId /*, selectedAgents */);
      
      if (response.success && response.data) {
        const botMessage = { 
          text: response.data.merged_text, 
          sender: 'aetherpro', 
          type: 'merged',
          sources: response.data.contributing_llms || [],
          requestId: response.data.request_id // Store request_id if needed
        };
        set((state) => ({ messages: [...state.messages, {id: Date.now(), ...botMessage}] }));
      } else {
        const errorMessage = response.message || "An unknown error occurred while fetching the response.";
        set((state) => ({ 
          messages: [...state.messages, {id: Date.now(), text: `Error: ${errorMessage}`, sender: 'aetherpro', type: 'error'}],
          error: errorMessage
        }));
      }
    } catch (error) {
      console.error("Error sending prompt:", error);
      const errorMessage = error.message || "Failed to send prompt. Please check your connection or the API server.";
      set((state) => ({ 
        messages: [...state.messages, {id: Date.now(), text: `Error: ${errorMessage}`, sender: 'aetherpro', type: 'error'}],
        error: errorMessage 
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useChatStore;