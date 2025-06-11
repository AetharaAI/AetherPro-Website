// src/pages/ConsolePage.tsx - Fixed with stable WebSocket and other corrections
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send,
  Download,
  Copy,
  Share,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  X,
  FileText,
  Code,
  Image,
  Archive,
  Plus,
  MessageSquare,
  Upload,
  Trash2,
  Edit3
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Import your API service
import { 
  getModules, 
  submitPrompt, 
  uploadFile, 
  createWebSocketConnection,
  WebSocketMessage,
  IndividualResponseMessage,
  MergedResponseMessage
} from '../services/api';

// Enhanced types for conversation history
interface Agent {
  id: string;
  name: string;
  provider?: string;
  status?: string; 
  description?: string; 
  version?: string; 
}

interface ChatTurn {
  id: string;
  timestamp: string;
  prompt: string;
  files?: { filename: string; size: number; content_type: string }[];
  responses: Record<string, LLMResponse>;
  mergedResponse: LLMResponse | null;
  selectedAgent: Agent;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  lastUpdated: string;
  agent?: string; 
  turns: ChatTurn[];
  userId?: string;
}

interface LLMResponse {
  content: string;
  version?: string;
  tools?: string[];
  agent_id?: string; 
  request_id?: string;
  error?: string;
  reasoning?: string;
  source_agents?: string[];
}

// Enhanced Conversation API functions
const conversationAPI = {
  // Get all conversations for current user
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Fallback to localStorage for development
      const stored = localStorage.getItem('aetherpro_conversations');
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Save a conversation
  saveConversation: async (conversation: Conversation): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversation)
      });
      if (!response.ok) throw new Error('Failed to save conversation');
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Fallback to localStorage for development
      const stored = localStorage.getItem('aetherpro_conversations');
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
      }
      localStorage.setItem('aetherpro_conversations', JSON.stringify(conversations));
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // Fallback to localStorage for development
      const stored = localStorage.getItem('aetherpro_conversations');
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem('aetherpro_conversations', JSON.stringify(filtered));
    }
  },

  // Update conversation title
  updateConversationTitle: async (conversationId: string, title: string): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/conversations/${conversationId}/title`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Failed to update conversation title');
    } catch (error) {
      console.error('Error updating conversation title:', error);
      // Fallback to localStorage for development
      const stored = localStorage.getItem('aetherpro_conversations');
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.title = title;
        conversation.lastUpdated = new Date().toISOString();
        localStorage.setItem('aetherpro_conversations', JSON.stringify(conversations));
      }
    }
  }
};

// Utility function to generate conversation title from first prompt
const generateConversationTitle = (prompt: string): string => {
  const words = prompt.trim().split(/\s+/).slice(0, 6);
  const title = words.join(' ');
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

// --- Header Component with Logo ---
const Header = ({ darkMode, toggleDarkMode, selectedAgent, setSelectedAgent, availableAgents }: {
  darkMode: boolean;
  toggleDarkMode: () => void;
  selectedAgent: Agent;
  setSelectedAgent: (agent: Agent) => void;
  availableAgents: Agent[];
}) => {
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

  return (
    <header className="aetherpro-nav px-6 py-4 relative z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/aether-logo.png" 
              alt="AetherPro Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to gradient if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" style={{display: 'none'}}></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AetherPro Console</h1>
          </div>

          <div className="relative z-50">
            <button
              onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedAgent.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {agentDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 aetherpro-modal rounded-lg shadow-lg z-50">
                {availableAgents.map((agent: Agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setAgentDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{agent.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{agent.provider || 'N/A'}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${agent.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {agent.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Enhanced Sidebar Component with History Management and Logo ---
const Sidebar = ({ 
  conversations, 
  onNewChat, 
  onSelectConversation, 
  currentConversationId,
  onDeleteConversation,
  onRenameConversation
}: {
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  currentConversationId: string;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (conversationId: string) => {
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <aside className="w-80 aetherpro-card border-r flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <img 
            src="/aether-logo.png" 
            alt="AetherPro Logo" 
            className="w-6 h-6 object-contain"
            onError={(e) => {
              // Fallback to gradient if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md" style={{display: 'none'}}></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AetherPro</h2>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Conversations ({conversations.length})
          </h3>
          {conversations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">No conversations yet.</p>
          ) : (
            conversations.map((conv: Conversation) => (
              <div
                key={conv.id}
                className={`relative group rounded-lg transition-colors ${
                  conv.id === currentConversationId 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {/* FIX: Changed outer element from <button> to <div> to prevent nesting errors */}
                <div
                  onClick={() => onSelectConversation(conv)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectConversation(conv)}
                  role="button"
                  tabIndex={0}
                  className="w-full text-left p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingId === conv.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveEdit(conv.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(conv.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full bg-transparent border border-blue-500 rounded px-1 text-sm font-medium text-gray-900 dark:text-white"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.title}
                        </h4>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatDate(conv.lastUpdated)}</span>
                        {conv.turns.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{conv.turns.length} turn{conv.turns.length !== 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conv);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Rename conversation"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this conversation?')) {
                            onDeleteConversation(conv.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

// --- Enhanced Chat History Display Component ---
const ChatHistory = ({ conversation, availableAgents }: { 
  conversation: Conversation | null;
  availableAgents: Agent[];
}) => {
  if (!conversation || conversation.turns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start a conversation to see the history here.</p>
        </div>
      </div>
    );
  }

  const renderResponseContent = (content: string) => {
    return content.split('```').map((part, index) => {
      if (index % 2 === 1) {
        const [lang, ...codeLines] = part.split('\n');
        const code = codeLines.join('\n');
        return (
          <div key={index} className="aetherpro-code rounded-lg overflow-hidden my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm text-gray-300">{lang || 'plaintext'}</span>
              <button 
                onClick={() => navigator?.clipboard?.writeText(code)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <div key={index} className="whitespace-pre-wrap">{part}</div>;
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {conversation.turns.map((turn, index) => (
        <div key={turn.id} className="space-y-4">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-3xl bg-blue-600 text-white rounded-lg p-4">
              <div className="whitespace-pre-wrap">{turn.prompt}</div>
              {turn.files && turn.files.length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-500">
                  <div className="text-xs text-blue-100 mb-1">Attached files:</div>
                  {turn.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="text-xs text-blue-200">
                      📎 {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-blue-200 mt-2">
                {new Date(turn.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Assistant Responses */}
          <div className="space-y-3">
            {Object.entries(turn.responses).map(([agentId, response]) => {
              const agent = availableAgents.find(a => a.id === agentId);
              return (
                <div key={agentId} className="dashboard-card rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {agent?.name || agentId}
                  </h4>
                  <div className="prose dark:prose-invert max-w-none">
                    {response.error ? (
                      <p className="text-red-500 dark:text-red-400">Error: {response.error}</p>
                    ) : (
                      renderResponseContent(response.content)
                    )}
                  </div>
                </div>
              );
            })}

            {turn.mergedResponse && (
              <div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                  🔮 Orchestrated Response
                </h4>
                <div className="prose dark:prose-invert max-w-none">
                  {turn.mergedResponse.error ? (
                    <p className="text-red-500 dark:text-red-400">Error: {turn.mergedResponse.error}</p>
                  ) : (
                    renderResponseContent(turn.mergedResponse.content)
                  )}
                  {turn.mergedResponse.reasoning && (
                    <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-2">
                      Reasoning: {turn.mergedResponse.reasoning}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {index < conversation.turns.length - 1 && (
            <hr className="border-gray-200 dark:border-gray-700" />
          )}
        </div>
      ))}
    </div>
  );
};

// --- File Upload Zone Component ---
const FileUploadZone = ({ files, setFiles, isDragOver, setIsDragOver }: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isDragOver: boolean;
  setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [setIsDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, [setIsDragOver]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [setFiles, setIsDragOver]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.includes('text') || file.name.endsWith('.md')) return <FileText className="w-4 h-4" />;
    if (file.name.endsWith('.json') || file.name.endsWith('.jsonl')) return <Code className="w-4 h-4" />;
    if (file.name.endsWith('.zip')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drop files here or <span className="text-blue-600 hover:text-blue-700 font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supports: .txt, .csv, .md, .json, .jsonl, .odt, .zip, .pdf, .docx, .xlsx
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.csv,.md,.json,.jsonl,.odt,.zip,.pdf,.docx,.xlsx"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Enhanced Main Console Component ---
const ConsolePage = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent>({ id: 'merged', name: 'Merged View', status: 'online' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // States for chat interface
  const [currentSessionId, setCurrentSessionId] = useState(() => uuidv4());
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({});
  const [mergedResponse, setMergedResponse] = useState<LLMResponse | null>(null);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const websocket = useRef<WebSocket | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const responsesRef = useRef<Record<string, LLMResponse>>({});
  
  // FIX: Use a ref to hold the data for the turn being processed.
  // This avoids stale closures and prevents the WebSocket from reconnecting on every input change.
  const submissionDataRef = useRef<{ prompt: string; files: File[]; selectedAgent: Agent } | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await conversationAPI.getConversations();
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, []);

  // Save conversation function
  const saveCurrentConversation = useCallback(async () => {
    if (!currentConversation) return;

    try {
      await conversationAPI.saveConversation(currentConversation);
      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === currentConversation.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = currentConversation;
          return updated;
        } else {
          return [currentConversation, ...prev];
        }
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, [currentConversation]);

  // Add turn to current conversation
  const addTurnToConversation = useCallback((
    turnPrompt: string,
    turnFiles: File[],
    turnResponses: Record<string, LLMResponse>,
    turnMergedResponse: LLMResponse | null,
    turnSelectedAgent: Agent
  ) => {
    const turn: ChatTurn = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      prompt: turnPrompt,
      files: turnFiles.map(f => ({
        filename: f.name,
        size: f.size,
        content_type: f.type
      })),
      responses: turnResponses,
      mergedResponse: turnMergedResponse,
      selectedAgent: turnSelectedAgent
    };

    setCurrentConversation(prev => {
      if (!prev) {
        // Create new conversation
        const newConversation: Conversation = {
          id: currentSessionId,
          title: generateConversationTitle(turnPrompt),
          timestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          agent: turnSelectedAgent.name,
          turns: [turn],
          userId: user?.id
        };
        return newConversation;
      } else {
        // Add turn to existing conversation
        const updated = {
          ...prev,
          turns: [...prev.turns, turn],
          lastUpdated: new Date().toISOString()
        };
        return updated;
      }
    });
  }, [currentSessionId, user?.id]);

  // Keep refs updated for access inside callbacks
  useEffect(() => { currentRequestIdRef.current = currentRequestId; }, [currentRequestId]);
  useEffect(() => { responsesRef.current = responses; }, [responses]);
  
  // Auto-save conversation when it changes
  useEffect(() => {
    if (currentConversation && currentConversation.turns.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentConversation();
      }, 1000); // Save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentConversation, saveCurrentConversation]);

  // WebSocket connection setup
  useEffect(() => {
    console.log('=== WEBSOCKET EFFECT RUNNING ===');
    console.log('🔌 Tying WebSocket to session ID:', currentSessionId);
    
    if (websocket.current) {
      console.log('🔌 Closing existing WebSocket');
      websocket.current.close();
    }

    if (!currentSessionId) {
      console.warn("❌ No currentSessionId, WebSocket connection paused.");
      return;
    }

    console.log('🔌 Creating new WebSocket connection...');
    websocket.current = createWebSocketConnection(
      currentSessionId,
      (message: WebSocketMessage) => {
        if (message.type === 'ping') {
          console.log('📨 Ping received, sending pong...');
          websocket.current?.send(JSON.stringify({ type: 'pong', currentSessionId }));
          return;
        }
        console.log('📨 WS Message received:', message);
        console.log('   Current Request ID:', currentRequestIdRef.current);
        console.log('   Message Request ID:', message.request_id);

        if (message.request_id !== currentRequestIdRef.current) {
            console.log('📨 Ignoring message for a different request.');
            return;
        }

        if (message.type === 'individual_response') {
          console.log('📨 Processing individual response from:', message.agent_id);
          setResponses((prev) => ({
            ...prev,
            [message.agent_id as string]: {
              content: (message as IndividualResponseMessage).content,
              version: (message as IndividualResponseMessage).version,
              tools: (message as IndividualResponseMessage).tools,
              error: message.error
            }
          }));
        } else if (message.type === 'merged_response') {
          console.log('📨 Processing merged response');
          const mergedResp: LLMResponse = {
              content: (message as MergedResponseMessage).content,
              agent_id: 'merged',
              reasoning: (message as MergedResponseMessage).reasoning,
              error: message.error,
          };
          setMergedResponse(mergedResp);
          setIsLoading(false);
          
          console.log('📨 Merged response complete. Adding turn to conversation...');
          
          // FIX: Use the data captured at submission time from the ref
          if (submissionDataRef.current) {
            addTurnToConversation(
              submissionDataRef.current.prompt,
              submissionDataRef.current.files,
              responsesRef.current,
              mergedResp,
              submissionDataRef.current.selectedAgent
            );
            submissionDataRef.current = null; // Clear the ref after use
          } else {
            console.warn("⚠️ Could not find submission data to create conversation turn.");
          }

        } else if (message.type === 'system_error') {
          console.error('❌ System Error from Backend:', message.error, message.details);
          const errorResponse: LLMResponse = {
            content: `A system error occurred: ${message.error || 'Unknown error'}`,
            agent_id: 'system_error',
            error: message.error,
            reasoning: JSON.stringify(message.details || {})
          };
          setMergedResponse(errorResponse);
          setIsLoading(false);
          
          if (submissionDataRef.current) {
            addTurnToConversation(
              submissionDataRef.current.prompt,
              submissionDataRef.current.files,
              responsesRef.current,
              errorResponse,
              submissionDataRef.current.selectedAgent
            );
            submissionDataRef.current = null;
          }
        }
      },
      (error: Event) => console.error('❌ WebSocket error:', error),
      (event: CloseEvent) => console.log('🔌 WebSocket closed:', event.code, event.reason)
    );
    return () => {
      if (websocket.current) {
        console.log('🔌 Cleaning up WebSocket connection for session', currentSessionId);
        websocket.current.close();
        websocket.current = null;
      }
    };
  // FIX: The dependency array is now stable and will only run when the chat session changes.
  }, [currentSessionId, addTurnToConversation]);

  // Fetch available agents/modules
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const modules = await getModules();
        
        const agents: Agent[] = modules
          .filter((m: any) => m.state === 'RUNNING' && (m.id.includes('agent') || m.id.includes('llm') || m.id === 'orchestrator' || m.id.includes('planner') || m.id.includes('structured_content_agent')))
          .map((m: any) => ({
            id: m.id,
            name: m.name,
            provider: m.id.includes('openai') ? 'OpenAI' :
                      m.id.includes('claude') ? 'Anthropic' :
                      m.id.includes('gemini') ? 'Google' :
                      m.id.includes('cohere') ? 'Cohere' :
                      m.id.includes('llama') ? 'Local/HuggingFace' : 'AetherPro',
            status: m.state === 'RUNNING' ? 'online' : 'offline',
            description: m.description,
            version: m.version
          }));

        const mergedOption: Agent = { 
          id: 'merged', 
          name: 'Merged View', 
          status: 'online', 
          description: 'Orchestrates responses across all active agents.' 
        };
        
        setAvailableAgents([mergedOption, ...agents]);
        if (!availableAgents.some(a => a.id === selectedAgent.id)) {
            setSelectedAgent(mergedOption);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
        const fallbackAgents: Agent[] = [
          { id: 'merged', name: 'Merged View', status: 'online', description: 'Orchestrates responses across all active agents.' },
          { id: 'dummy_agent', name: 'Demo Agent', status: 'online', provider: 'AetherPro' }
        ];
        setAvailableAgents(fallbackAgents);
        setSelectedAgent(fallbackAgents[0]);
      }
    };
    
    fetchAgents();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleNewChat = () => {
    console.log('Starting new chat...');
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    setCurrentConversation(null);
    setCurrentRequestId(null);
    setResponses({});
    setMergedResponse(null);
    setPrompt('');
    setFiles([]);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selected conversation:', conversation.id);
    if (currentSessionId === conversation.id) return;

    setCurrentSessionId(conversation.id);
    setCurrentConversation(conversation);
    // Reset volatile state for the new conversation view
    setCurrentRequestId(null);
    setResponses({});
    setMergedResponse(null);
    setPrompt('');
    setFiles([]);
    setIsLoading(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleRenameConversation = async (conversationId: string, newTitle: string) => {
    try {
      await conversationAPI.updateConversationTitle(conversationId, newTitle);
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, title: newTitle, lastUpdated: new Date().toISOString() }
            : c
        )
      );
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => 
          prev ? { ...prev, title: newTitle, lastUpdated: new Date().toISOString() } : null
        );
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || (!prompt.trim() && files.length === 0)) return;

    console.log('=== SUBMIT PROMPT START ===');
    
    setIsLoading(true);
    setResponses({});
    setMergedResponse(null);
    const newRequestId = uuidv4();
    setCurrentRequestId(newRequestId);

    // FIX: Capture submission data in the ref
    submissionDataRef.current = { prompt, files, selectedAgent };

    console.log('🎯 Submitting with Request ID:', newRequestId);

    try {
      const uploadedFilePaths: { filename: string; temp_path: string; size: number; content_type: string }[] = [];
      for (const file of files) {
          const data = await uploadFile(file);
          uploadedFilePaths.push(data);
      }

      const selectedAgents = selectedAgent.id !== 'merged' ? [selectedAgent.id] : null;

      await submitPrompt(
        prompt,
        currentSessionId,      
        newRequestId,
        selectedAgents,
        uploadedFilePaths
      );

      console.log('✅ Prompt submitted successfully.');
      setPrompt('');
      setFiles([]);

    } catch (error: any) {
      console.error('❌ Error submitting prompt:', error);
      setMergedResponse({
        content: `Error during submission: ${error.message}`,
        error: error.message
      });
      setIsLoading(false);
    }
    
    console.log('=== SUBMIT PROMPT END ===');
  };

  // Set initial dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        availableAgents={availableAgents}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversation?.id || ''}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentConversation && currentConversation.turns.length > 0 ? (
              <ChatHistory conversation={currentConversation} availableAgents={availableAgents} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Welcome to AetherPro Console</p>
                  <p className="text-sm">Start a conversation or select from your history.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <FileUploadZone
                  files={files}
                  setFiles={setFiles}
                  isDragOver={isDragOver}
                  setIsDragOver={setIsDragOver}
                />
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Send a message to ${selectedAgent.name}...`}
                    className="aetherpro-input w-full p-4 pr-12 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50 dark:bg-gray-800"
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmit(e);
                      }
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || (!prompt.trim() && files.length === 0)}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
                  </span>
                  <span>
                    {prompt.length} characters
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolePage;