// src/store/chatStore.js
import { create } from 'zustand';

export const useChatStore = create((set) => ({
  // Core chat state
  messages: [], // Array of { role: 'user'|'assistant', content: 'text', id: 'uuid' }
  isLoadingResponse: false,
  chatError: null,

  // Agent selection state
  selectedAgentIds: [], // Array of agent IDs (strings)
  currentSessionId: null, // String or null

  // Actions for messages
  addMessage: (message) => set((state) => ({ messages: [...state.messages, { ...message, id: uuidv4() }] })), // Assuming uuidv4 is available or passed
  setLoadingResponse: (isLoading) => set({ isLoadingResponse: isLoading }),
  setChatError: (error) => set({ chatError: error }),
  clearChat: () => set({ messages: [], chatError: null }),

  // Actions for agent selection
  toggleAgentSelection: (agentId) => set((state) => {
    const currentSelection = state.selectedAgentIds;
    if (currentSelection.includes(agentId)) {
      return { selectedAgentIds: currentSelection.filter((id) => id !== agentId) };
    } else {
      return { selectedAgentIds: [...currentSelection, agentId] };
    }
  }),
  setSelectedAgentIds: (ids) => set({ selectedAgentIds: ids }), // For initial or programmatic setting

  // Actions for session management
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  clearSession: () => set({ currentSessionId: null, messages: [] }), // Clear messages when session changes

  // You might also add actions for sending prompts
  // sendPrompt: async (promptText, token) => { /* ... */ }
}));

// Helper to generate UUIDs (you might have this in lib/utils.js or install uuid package)
// For simplicity, including a basic one here or ensure you import it from somewhere.
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
export default useChatStore;