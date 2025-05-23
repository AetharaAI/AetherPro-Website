// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://66.179.241.125:8000'; // Your FastAPI server URL

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Add Authorization header here if/when you implement auth
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      console.error(`API Error ${response.status} for ${url}:`, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    // Handle cases where response might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
    return response.text(); // Or handle as blob, etc., if needed
  } catch (error) {
    console.error(`Network or other error for ${url}:`, error);
    throw error; // Re-throw to be caught by calling component
  }
}

export const submitPrompt = async (promptText, sessionId = null, selectedAgents = null) => {
  const payload = {
    prompt_text: promptText,
  };
  if (sessionId) {
    payload.session_id = sessionId;
  }
  if (selectedAgents && selectedAgents.length > 0) {
    payload.selected_agents_override = selectedAgents;
  }
  return fetchApi('/api/v1/prompt', { // Ensure this matches your FastAPI endpoint
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getSystemStatus = async () => {
  return fetchApi('/api/v1/system/status'); // Ensure this matches
};

export const getAgents = async () => {
  return fetchApi('/api/v1/agents'); // Ensure this matches
};

// Add more API functions here as needed:
// export const getMemoryRecords = async (filters) => { ... }
// export const updateAgentConfig = async (agentId, config) => { ... }