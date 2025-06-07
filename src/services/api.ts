// src/services/api.ts

import { API_BASE_URL } from '../config'; // Import API_BASE_URL from your config.ts

// --- Type Definitions (NEW) ---

// Response from /api/auth/login or /api/auth/signup
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
    picture?: string;
  };
  token: string;
}

// User object as returned by /api/auth/me
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  picture?: string;
  // Add other fields like stripeCustomerId if /api/auth/me returns them
}

// Module/Agent info from /api/v1/modules
export interface ModuleInfo {
  id: string;
  name: string;
  provider?: string;
  status?: string; // e.g., 'RUNNING', 'STOPPED'
  description?: string;
  version?: string;
}

// Attached file info sent to backend
export interface AttachedFile {
  filename: string;
  temp_path: string;
  size: number;
  content_type: string;
}

// WebSocket message types (matching UIManagerModule's Redis messages)
interface WebSocketMessageBase {
  type: string;
  request_id?: string;
  agent_id?: string;
  error?: string;
  details?: any;
}

export interface IndividualResponseMessage extends WebSocketMessageBase {
  type: 'individual_response';
  request_id: string;
  agent_id: string;
  content: string;
  version?: string;
  tools?: string[];
  error?: string;
}

export interface MergedResponseMessage extends WebSocketMessageBase {
  type: 'merged_response';
  request_id: string;
  content: string;
  reasoning?: string;
  error?: string;
}

export interface SystemErrorMessage extends WebSocketMessageBase {
  type: 'system_error';
  error: string;
  details?: any;
}

// Generic WebSocket message union type
export type WebSocketMessage = IndividualResponseMessage | MergedResponseMessage | SystemErrorMessage | WebSocketMessageBase;


// --- Token Management (Updated for 'jwt_token') ---
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token'); // AuthContext uses 'jwt_token'
};

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('jwt_token', token);
  } else {
    localStorage.removeItem('jwt_token');
  }
};

const clearAuthToken = () => {
  localStorage.removeItem('jwt_token');
};

// --- Core API Fetch Wrapper ---
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Making request to:', url);

  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json', // Always request JSON response
  };

  // Add Content-Type if body is JSON, but not for FormData
  if (options.body && typeof options.body === 'string' && options.headers && !('Content-Type' in options.headers)) {
      defaultHeaders['Content-Type'] = 'application/json';
  } else if (options.body instanceof FormData) {
      // Do NOT set Content-Type for FormData; browser handles it for correct boundary
  } else if (!options.body) {
      // No body, no content-type needed
  } else if (!options.headers || !('Content-Type' in options.headers)) {
      // Default to application/json for other non-FormData bodies if not specified
      defaultHeaders['Content-Type'] = 'application/json';
  }


  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers, // Allow overriding default headers
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 unauthorized - token might be expired
    if (response.status === 401) {
      clearAuthToken();
      // Optionally redirect to login or dispatch logout action
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/auth/callback') {
        window.location.href = '/login'; // Redirect to login page
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText, message: response.statusText }));
      console.error(`API Error ${response.status} for ${url}:`, errorData);
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    // For non-JSON responses, return text or null
    return response.text() as unknown as T; // Cast for generic type safety
  } catch (error) {
    console.error(`Network or other error for ${url}:`, error);
    throw error;
  }
}

// --- LLM/ORCHESTRATION ENDPOINTS ---

// submitPrompt: Strict typing for backend non-optional sessionId and requestId
export const submitPrompt = async (
  promptText: string,
  sessionId: string, // Backend expects string, not nullable
  selectedAgents: string[] | null = null,
  requestId: string, // Backend expects string, not optional/nullable
  attachedFiles: AttachedFile[] = []
): Promise<any> => {
  const payload = {
    prompt_text: promptText,
    session_id: sessionId, // Always send
    request_id: requestId, // Always send
    selected_agents_override: selectedAgents,
    attached_files: attachedFiles,
  };
  
  return fetchApi('/api/v1/prompt', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getSystemStatus = async (): Promise<any> => {
  return fetchApi('/api/v1/system/status');
};

export const getModules = async (): Promise<ModuleInfo[]> => { // Explicit return type
  return fetchApi('/api/v1/modules');
};

export const uploadFile = async (file: File): Promise<AttachedFile> => { // Explicit return type
  const formData = new FormData();
  formData.append('file', file);
  
  return fetchApi('/api/v1/upload-file', {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};

export const parseLogsFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return fetchApi('/api/v1/logs/parse', {
    method: 'POST',
    body: formData,
    headers: {},
  });
};

// --- AUTHENTICATION ENDPOINTS ---

export const signup = async (userData: {name: string; email: string; password: string;}): Promise<AuthResponse> => {
  return fetchApi('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const login = async (credentials: {email: string; password: string;}): Promise<AuthResponse> => {
  return fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const logout = async (): Promise<{ success: boolean }> => {
  clearAuthToken();
  return { success: true };
};

export const getCurrentUser = async (): Promise<UserProfile> => { // Explicit return type
  return fetchApi('/api/auth/me');
};

// --- API KEYS ENDPOINTS ---
interface ApiKeyResponseBackend { // Define based on backend response, then map to frontend type
  id: string;
  name: string;
  key_preview: string;
  created: string; // ISO string from backend
  last_used: string | null; // ISO string from backend
  request_count: number;
  is_active: boolean;
}

// Convert backend string dates to Date objects for frontend ApiKeyResponse
export interface FrontendApiKeyResponse {
  id: string;
  name: string;
  keyPreview: string; // CamelCase for frontend
  created: Date;
  lastUsed: Date | null;
  requestCount: number;
  isActive: boolean;
}

export const getApiKeys = async (): Promise<FrontendApiKeyResponse[]> => {
  const rawKeys: ApiKeyResponseBackend[] = await fetchApi('/api/auth/api-keys');
  return rawKeys.map(key => ({
    id: key.id,
    name: key.name,
    keyPreview: key.key_preview,
    created: new Date(key.created),
    lastUsed: key.last_used ? new Date(key.last_used) : null,
    requestCount: key.request_count,
    isActive: key.is_active,
  }));
};

export const createApiKey = async (keyData: { name: string }): Promise<{ key: string; apiKey: FrontendApiKeyResponse }> => {
  const result: {key: string; apiKey: ApiKeyResponseBackend} = await fetchApi('/api/auth/api-keys', {
    method: 'POST',
    body: JSON.stringify(keyData),
  });
  return {
    key: result.key,
    apiKey: {
      id: result.apiKey.id,
      name: result.apiKey.name,
      keyPreview: result.apiKey.key_preview,
      created: new Date(result.apiKey.created),
      lastUsed: result.apiKey.last_used ? new Date(result.apiKey.last_used) : null,
      requestCount: result.apiKey.request_count,
      isActive: result.apiKey.is_active,
    }
  };
};

export const deleteApiKey = async (keyId: string): Promise<{ success: boolean; message: string }> => {
  return fetchApi(`/api/auth/api-keys/${keyId}`, {
    method: 'DELETE',
  });
};

// --- DASHBOARD ENDPOINTS ---
export const getDashboardStats = async (): Promise<any> => {
  return fetchApi('/api/dashboard/stats');
};

// --- STRIPE ENDPOINTS ---
export const createCheckoutSession = async (
  planName: string, // Changed from priceId to planName to match backend
  billingCycle: 'monthly' | 'annually', // Added billingCycle
): Promise<{ session_url: string }> => { // Backend returns session_url
  return fetchApi('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      plan_name: planName,      // Send planName
      billing_cycle: billingCycle, // Send billingCycle
    }),
  });
};

export const createCustomerPortalSession = async (): Promise<{ portal_url: string }> => { // Backend returns portal_url
  // Backend doesn't need returnUrl in payload anymore if it's hardcoded to frontend_base_url
  return fetchApi('/api/stripe/create-customer-portal-session', {
    method: 'POST',
    // No body needed as returnUrl is configured on backend
  });
};


// --- WEBSOCKET CONNECTION HELPER ---
export const createWebSocketConnection = (
  sessionId: string, 
  onMessage: (message: WebSocketMessage) => void, // Strict type for onMessage
  onError: (event: Event) => void, 
  onClose: (event: CloseEvent) => void
): WebSocket => {
  // Use window.location.protocol for dynamic ws/wss
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Correctly parse the API_BASE_URL to get the host
  const apiUrl = new URL(API_BASE_URL);
  const wsHost = apiUrl.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/chat?session_id=${sessionId}`;
  
  console.log('WebSocket connecting to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected for session:', sessionId);
  };
  
  ws.onmessage = (event) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data); // Cast to WebSocketMessage type
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      // Fallback for parsing errors: send a system error message
      onMessage({ type: 'system_error', error: 'Failed to parse WebSocket message', details: (error as Error).message, request_id: 'N/A_WS_PARSE_ERROR' });
    }
  };
  
  ws.onerror = (errorEvent: Event) => { // Use ErrorEvent type if available, or just Event
    console.error('WebSocket error:', errorEvent);
    onError(errorEvent);
  };
  
  ws.onclose = (event: CloseEvent) => { // Explicitly use CloseEvent type
    console.log('WebSocket closed:', event.code, event.reason);
    onClose(event);
  };
  
  return ws;
};

// --- UTILITY FUNCTIONS ---
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getStoredToken = (): string | null => {
  return getAuthToken();
};

export const setStoredToken = (token: string): void => {
  setAuthToken(token);
};

export const clearStoredToken = (): void => {
  clearAuthToken();
};

// --- ERROR HANDLING UTILITIES ---
interface ApiErrorDetails {
  type: 'auth_error' | 'validation_error' | 'general_error';
  message: string;
  shouldRedirect: boolean;
}

export const handleApiError = (error: any): ApiErrorDetails => {
  const errorMessage = error.message || 'An unexpected error occurred';

  if (errorMessage === 'Authentication required') {
    return {
      type: 'auth_error',
      message: 'Please log in to continue',
      shouldRedirect: true
    };
  }
  
  if (errorMessage.includes('User with this email already exists')) {
    return {
      type: 'validation_error',
      message: 'An account with this email already exists',
      shouldRedirect: false
    };
  }
  
  if (errorMessage.includes('Invalid email or password')) {
    return {
      type: 'auth_error',
      message: 'Invalid email or password',
      shouldRedirect: false
    };
  }
  
  return {
    type: 'general_error',
    message: errorMessage,
    shouldRedirect: false
  };
};

// --- DEVELOPMENT/DEBUG HELPERS ---
export const testConnection = async (): Promise<any> => {
  try {
    const response = await fetchApi('/health');
    console.log('API connection test successful:', response);
    return response;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};