// src/services/api.js (Updated submitPrompt)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://66.179.241.125:8000'; // Your FastAPI server URL

async function fetchApi(endpoint, options = {}, token = null) { // Added token parameter
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header here if/when you implement auth
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    console.error(`Network or other error for ${url}:`, error);
    throw error;
  }
}

// export const submitPrompt = async (promptText, sessionId = null, selectedAgents = null) => { // OLD
export const submitPrompt = async (promptText, sessionId = null, selectedAgents = null, token = null) => { // NEW: Add token
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
  }, token); // Pass token to fetchApi
};

export const getSystemStatus = async (token = null) => { // Add token
  return fetchApi('/api/v1/system/status', {}, token);
};

export const getAgents = async (token = null) => { // Add token
  return fetchApi('/api/v1/agents', {}, token);
};
export const api = {
  fetchApi,
  submitPrompt,
  getSystemStatus,
  getAgents,
};

// ...