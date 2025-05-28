// src/components/chat/ChatInput.jsx (Conceptual)
import React, { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
// --- FIX: Import submitPrompt ---
import { submitPrompt } from '../../services/api'; 
import LoadingSpinner from '../common/LoadingSpinner';

const ChatInput = () => {
  const [inputText, setInputText] = useState('');
  const { addMessage, setLoadingResponse, selectedAgentIds, setCurrentSessionId, currentSessionId } = useChatStore();
  const { isAuthenticated, userToken } = useAuthStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isAuthenticated) return;

    const userMessage = { role: 'user', content: inputText };
    addMessage(userMessage);
    setLoadingResponse(true);
    setInputText('');

    try {
      // --- FIX: Call submitPrompt with selected agents ---
      const response = await submitPrompt(inputText, currentSessionId, selectedAgentIds, userToken); // userToken needs to be passed to submitPrompt
      
      addMessage({ role: 'assistant', content: response.merged_text || response.error || 'No response.' });
      if (response.session_id && !currentSessionId) {
        setCurrentSessionId(response.session_id); // Set session ID if not already set
      }
    } catch (error) {
      console.error('Error submitting prompt:', error);
      addMessage({ role: 'assistant', content: `Error: ${error.message || 'Could not get response.'}` });
    } finally {
      setLoadingResponse(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow p-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        disabled={!isAuthenticated}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;