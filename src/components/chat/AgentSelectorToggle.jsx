// src/components/chat/AgentSelectorToggle.jsx
import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSystemStore } from '../../store/systemStore';
import { useAuthStore } from '../../store/authStore';
// --- FIX: Import specific functions directly ---
import { submitPrompt, getAgents } from '../../services/api'; // Use the specific named exports
import LoadingSpinner from '../common/LoadingSpinner';

const AgentSelectorToggle = () => {
  const { isAuthenticated, userToken } = useAuthStore();
  const { selectedAgentIds, setSelectedAgentIds, toggleAgentSelection } = useChatStore();
  const { availableModules, fetchAvailableModules, isLoadingModules } = useSystemStore();

  const [localAgentList, setLocalAgentList] = useState([]);
  const [error, setError] = useState(null);
  const [isUpdatingBackend, setIsUpdatingBackend] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !availableModules.length && !isLoadingModules) {
      // --- FIX: Call the fetch function from systemStore ---
      fetchAvailableModules(userToken); // This will call getAgents internally
    }
    const llmAgents = availableModules.filter(module => 
      module.capabilities && module.capabilities.includes("text_generation") ||
      module.capabilities && module.capabilities.includes("structured_output") ||
      module.capabilities && module.capabilities.includes("logical_reasoning") ||
      module.capabilities && module.capabilities.includes("general_knowledge") ||
      module.capabilities && module.capabilities.includes("coding") ||
      module.capabilities && module.capabilities.includes("summarization") ||
      module.capabilities && module.capabilities.includes("analysis")
    );
    setLocalAgentList(llmAgents);
  }, [isAuthenticated, availableModules, isLoadingModules, fetchAvailableModules, userToken]); // Added userToken to dependencies

  const sendAgentSelectionOverride = async () => {
    if (!isAuthenticated || !userToken) {
      setError("User not authenticated.");
      return;
    }
    setIsUpdatingBackend(true);
    setError(null);
    try {
      // This is a conceptual API call. Your actual API would receive selected_agents_override
      // as part of the prompt submission. This is for demonstration if you want a separate
      // "Apply Agents" button.
      // --- FIX: Call submitPrompt directly if you add a dummy endpoint for this ---
      // For now, this part is still mock/conceptual as your FastAPI /api/v1/prompt
      // is for submitting prompts, not just agent selection overrides.
      // If you need a separate endpoint to update agent selection without a prompt:
      // await fetchApi('/api/v1/update_agent_selection', { method: 'POST', body: JSON.stringify({ selected_agents_override: selectedAgentIds }) }, userToken);
      console.log("Sending selected agents override to backend (conceptual):", selectedAgentIds);
      
      setTimeout(() => {
        console.log("Agent selection override conceptualized success.");
        setIsUpdatingBackend(false);
      }, 500);
      
    } catch (err) {
      console.error("Failed to send agent selection override:", err);
      setError("Failed to update agent selection.");
      setIsUpdatingBackend(false);
    }
  };

  // ... (rest of the component) ...
};

export default AgentSelectorToggle;