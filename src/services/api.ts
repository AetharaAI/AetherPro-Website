// src/services/api.ts

import { API_BASE_URL } from '../config'; // Import API_BASE_URL from your config.ts

// ===================================================================================
// --- TYPE DEFINITIONS ---
// ===================================================================================

// --- Generic API & Auth Types ---

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

// --- WebSocket Message Types ---

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

export type WebSocketMessage = IndividualResponseMessage | MergedResponseMessage | SystemErrorMessage | WebSocketMessageBase;

// --- Conversation Types ---

export interface ChatTurn {
  id: string;
  timestamp: string; // ISO string
  prompt: string;
  files?: Array<{
    filename: string;
    size: number;
    content_type: string;
  }>;
  responses: Record<string, any>;
  merged_response: any | null;
  selected_agent: {
    id: string;
    name: string;
  };
}

export interface ConversationModel {
  id: string;
  title: string;
  timestamp: string; // ISO string  
  last_updated: string; // ISO string
  agent?: string;
  turns: ChatTurn[];
  user_id?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  timestamp: string; // ISO string
  last_updated: string; // ISO string
  agent?: string;
  turn_count: number;
}


// ===================================================================================
// --- CORE API INFRASTRUCTURE ---
// ===================================================================================

// --- Token Management ---
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
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
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string' && (!options.headers || !('Content-Type' in options.headers))) {
      defaultHeaders['Content-Type'] = 'application/json';
  } else if (options.body instanceof FormData) {
      // Browser handles Content-Type for FormData
  } else if (options.body) {
      defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      clearAuthToken();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/auth/callback') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText, message: response.statusText }));
      console.error(`API Error ${response.status} for ${url}:`, errorData);
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text() as unknown as T;
  } catch (error) {
    console.error(`Network or other error for ${url}:`, error);
    throw error;
  }
}

// ===================================================================================
// --- API ENDPOINT FUNCTIONS ---
// ===================================================================================

// --- LLM/Orchestration Endpoints ---

export const submitPrompt = async (
  promptText: string,
  sessionId: string,
  requestId: string,
  selectedAgents: string[] | null = null,
  attachedFiles: AttachedFile[] = []
): Promise<any> => {
  const payload = {
    prompt_text: promptText,
    session_id: sessionId,
    request_id: requestId,
    selected_agents_override: selectedAgents,
    attached_files: attachedFiles,
  };
  return fetchApi('/api/v1/prompt', { method: 'POST', body: JSON.stringify(payload) });
};

export const getSystemStatus = async (): Promise<any> => {
  return fetchApi('/api/v1/system/status');
};

export const getModules = async (): Promise<ModuleInfo[]> => {
  return fetchApi('/api/v1/modules');
};

export const uploadFile = async (file: File): Promise<AttachedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi('/api/v1/upload-file', { method: 'POST', body: formData });
};

export const parseLogsFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi('/api/v1/logs/parse', { method: 'POST', body: formData });
};

// --- Authentication Endpoints ---

export const signup = async (userData: {name: string; email: string; password: string;}): Promise<AuthResponse> => {
  return fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(userData) });
};

export const login = async (credentials: {email: string; password: string;}): Promise<AuthResponse> => {
  return fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
};

export const logout = async (): Promise<{ success: boolean }> => {
  clearAuthToken();
  return { success: true };
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  return fetchApi('/api/auth/me');
};

// --- Conversation Endpoints ---

export const getConversations = async (): Promise<ConversationSummary[]> => {
  return fetchApi('/api/conversations');
};

export const getConversation = async (conversationId: string): Promise<ConversationModel> => {
  return fetchApi(`/api/conversations/${conversationId}`);
};

export const saveConversation = async (conversation: ConversationModel): Promise<{ success: boolean; message: string }> => {
  return fetchApi('/api/conversations', { method: 'POST', body: JSON.stringify(conversation) });
};

export const deleteConversation = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  return fetchApi(`/api/conversations/${conversationId}`, { method: 'DELETE' });
};

export const updateConversationTitle = async (conversationId: string, newTitle: string): Promise<{ success: boolean; message: string }> => {
  return fetchApi(`/api/conversations/${conversationId}/title`, { method: 'PATCH', body: JSON.stringify({ title: newTitle }) });
};

// --- API Keys Endpoints ---

interface ApiKeyResponseBackend {
  id: string;
  name: string;
  key_preview: string;
  created: string;
  last_used: string | null;
  request_count: number;
  is_active: boolean;
}

export interface FrontendApiKeyResponse {
  id: string;
  name: string;
  keyPreview: string;
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
  return fetchApi(`/api/auth/api-keys/${keyId}`, { method: 'DELETE' });
};

// --- Dashboard Endpoints ---

export const getDashboardStats = async (): Promise<any> => {
  return fetchApi('/api/dashboard/stats');
};

// --- Stripe Endpoints ---

export const createCheckoutSession = async (planName: string, billingCycle: 'monthly' | 'annually'): Promise<{ session_url: string }> => {
  return fetchApi('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan_name: planName, billing_cycle: billingCycle }),
  });
};

export const createCustomerPortalSession = async (): Promise<{ portal_url: string }> => {
  return fetchApi('/api/stripe/create-customer-portal-session', { method: 'POST' });
};

// ===================================================================================
// --- WEBSOCKET & UTILITY FUNCTIONS ---
// ===================================================================================

export const createWebSocketConnection = (
  sessionId: string, 
  onMessage: (message: WebSocketMessage) => void,
  onError: (event: Event) => void, 
  onClose: (event: CloseEvent) => void
): WebSocket => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const apiUrl = new URL(API_BASE_URL);
  const wsHost = apiUrl.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/chat?session_id=${sessionId}`;
  
  console.log('WebSocket connecting to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => console.log('WebSocket connected for session:', sessionId);
  
  ws.onmessage = (event) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      onMessage({ type: 'system_error', error: 'Failed to parse WebSocket message', details: (error as Error).message });
    }
  };
  
  ws.onerror = (errorEvent: Event) => {
    console.error('WebSocket error:', errorEvent);
    onError(errorEvent);
  };
  
  ws.onclose = (event: CloseEvent) => {
    console.log('WebSocket closed:', event.code, event.reason);
    onClose(event);
  };
  
  return ws;
};

export const isAuthenticated = (): boolean => !!getAuthToken();

export const getStoredToken = (): string | null => getAuthToken();

export const setStoredToken = (token: string): void => setAuthToken(token);

export const clearStoredToken = (): void => clearAuthToken();

// --- Error Handling Utilities ---
interface ApiErrorDetails {
  type: 'auth_error' | 'validation_error' | 'general_error';
  message: string;
  shouldRedirect: boolean;
}

export const handleApiError = (error: any): ApiErrorDetails => {
  const errorMessage = error.message || 'An unexpected error occurred';

  if (errorMessage === 'Authentication required') {
    return { type: 'auth_error', message: 'Please log in to continue', shouldRedirect: true };
  }
  
  if (errorMessage.includes('User with this email already exists')) {
    return { type: 'validation_error', message: 'An account with this email already exists', shouldRedirect: false };
  }
  
  if (errorMessage.includes('Invalid email or password')) {
    return { type: 'auth_error', message: 'Invalid email or password', shouldRedirect: false };
  }
  
  return { type: 'general_error', message: errorMessage, shouldRedirect: false };
};

// --- Development/Debug Helpers ---
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