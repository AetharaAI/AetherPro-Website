// src/pages/ConsolePage.tsx - Refactored with sliding sidebar and tool dropdown
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
  Edit3,
  Camera,
  Mic,
  Search,
  Globe,
  Calculator,
  Zap,
  Menu
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Component imports
import AudioRecorder from '../components/AudioRecorder';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';

// API imports
import { 
  getModules, 
  submitPrompt, 
  uploadFile, 
  createWebSocketConnection,
  WebSocketMessage,
  IndividualResponseMessage,
  MergedResponseMessage
} from '../services/api';

interface Attachment {
  type: 'file' | 'image_base64' | 'video' | 'audio_base64';
  name: string;
  data: File | string;
  size: number;
  contentType: string;
}

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

// Tool definition interface
interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  action: () => void;
  disabled?: boolean;
}

// Enhanced Conversation API functions
const conversationAPI = {
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
      const stored = localStorage.getItem('aetherpro_conversations');
      return stored ? JSON.parse(stored) : [];
    }
  },

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
      const stored = localStorage.getItem('aetherpro_conversations');
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem('aetherpro_conversations', JSON.stringify(filtered));
    }
  },

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

const generateConversationTitle = (prompt: string): string => {
  const words = prompt.trim().split(/\s+/).slice(0, 6);
  const title = words.join(' ');
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

// --- Sliding Sidebar Component ---
const SlidingSidebar = ({ 
  conversations, 
  onNewChat, 
  onSelectConversation, 
  currentConversationId,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onToggle
}: {
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  currentConversationId: string;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      lastWeek: [] as Conversation[],
      older: [] as Conversation[]
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.lastUpdated);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.lastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  const ConversationGroup = ({ 
    title, 
    conversations: groupConversations 
  }: { 
    title: string; 
    conversations: Conversation[] 
  }) => {
    if (groupConversations.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {groupConversations.map((conv) => (
            <div
              key={conv.id}
              className={`relative group mx-2 rounded-lg transition-all duration-200 ${
                conv.id === currentConversationId 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onMouseEnter={() => setHoveredConversation(conv.id)}
              onMouseLeave={() => setHoveredConversation(null)}
            >
              <div
                onClick={() => {
                  onSelectConversation(conv);
                  if (window.innerWidth < 768) {
                    onToggle();
                  }
                }}
                className="w-full text-left p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(conv.id)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleSaveEdit(conv.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate leading-5">
                        {conv.title}
                      </h4>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{formatDate(conv.lastUpdated)}</span>
                      {conv.turns.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{conv.turns.length} message{conv.turns.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {(hoveredConversation === conv.id || conv.id === currentConversationId) && (
                    <div className="flex items-center space-x-1 opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conv);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Rename conversation"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this conversation?')) {
                            onDeleteConversation(conv.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside 
        className={`
          fixed left-0 top-0 h-full z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-full md:w-80
          md:relative md:translate-x-0
          ${!isOpen ? 'md:w-0 md:border-r-0' : ''}
          flex flex-col
        `}
      >
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/aether-logo.png" 
                alt="AetherPro Logo" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
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
              onClick={onToggle}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {conversations.length > 0 && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredConversations.length === 0 ? (
            <div className="px-4">
              {searchQuery ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center">
                  No conversations match "{searchQuery}"
                </p>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs mt-1">Start chatting to see your history here.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <ConversationGroup title="Today" conversations={groupedConversations.today} />
              <ConversationGroup title="Yesterday" conversations={groupedConversations.yesterday} />
              <ConversationGroup title="Last 7 days" conversations={groupedConversations.lastWeek} />
              <ConversationGroup title="Older" conversations={groupedConversations.older} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </aside>
    </>
  );
};

// --- Sidebar Toggle Button ---
const SidebarToggle = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-lg hover:shadow-xl transition-all duration-200
        ${isOpen ? 'md:hidden' : 'md:block'}
        hover:bg-gray-50 dark:hover:bg-gray-700
      `}
      title={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  );
};

// --- Tool Dropdown Component ---
const ToolDropdown = ({ 
  tools, 
  onToolSelect 
}: { 
  tools: Tool[];
  onToolSelect: (tool: Tool) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (tool: Tool) => {
    if (!tool.disabled) {
      onToolSelect(tool);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <Zap className="w-4 h-4" />
        <span>Add Tool</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Available Tools
            </h3>
          </div>
          
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                disabled={tool.disabled}
                className={`w-full flex items-start space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                  tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <IconComponent className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tool.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Header Component ---
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

// --- Chat History Component ---
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
  files: Attachment[];
  setFiles: React.Dispatch<React.SetStateAction<Attachment[]>>;
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
    const newAttachments: Attachment[] = droppedFiles.map(file => ({
      type: 'file',
      name: file.name,
      data: file,
      size: file.size,
      contentType: file.type,
    }));
    setFiles(prev => [...prev, ...newAttachments]);
  }, [setFiles, setIsDragOver]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = selectedFiles.map(file => ({
      type: 'file',
      name: file.name,
      data: file,
      size: file.size,
      contentType: file.type,
    }));
    setFiles(prev => [...prev, ...newAttachments]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: Attachment) => {
    if (file.contentType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.contentType.includes('text') || file.name.endsWith('.md')) return <FileText className="w-4 h-4" />;
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

// --- Main Console Component ---
const ConsolePage = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent>({ id: 'merged', name: 'Merged View', status: 'online' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Chat interface states
  const [currentSessionId, setCurrentSessionId] = useState(() => uuidv4());
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({});
  const [mergedResponse, setMergedResponse] = useState<LLMResponse | null>(null);
  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  const websocket = useRef<WebSocket | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const responsesRef = useRef<Record<string, LLMResponse>>({});
  const submissionDataRef = useRef<{ prompt: string; files: File[]; selectedAgent: Agent } | null>(null);

  // Define available tools
  const availableTools: Tool[] = [
    {
      id: 'camera',
      name: 'Camera',
      icon: Camera,
      description: 'Capture images from your camera',
      action: () => setIsWebcamOpen(true)
    },
    {
      id: 'microphone',
      name: 'Microphone',
      icon: Mic,
      description: 'Record audio messages',
      action: () => setIsAudioModalOpen(true)
    },
    {
      id: 'web-search',
      name: 'Web Search',
      icon: Search,
      description: 'Search the web for information',
      action: () => console.log('Web search tool clicked'),
      disabled: true
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: Calculator,
      description: 'Perform mathematical calculations',
      action: () => console.log('Calculator tool clicked'),
      disabled: true
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: Globe,
      description: 'Browse websites and extract content',
      action: () => console.log('Browser tool clicked'),
      disabled: true
    }
  ];

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
      }, 1000);
      
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
          
          if (submissionDataRef.current) {
            addTurnToConversation(
              submissionDataRef.current.prompt,
              submissionDataRef.current.files,
              responsesRef.current,
              mergedResp,
              submissionDataRef.current.selectedAgent
            );
            submissionDataRef.current = null;
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
    setAttachments([]);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selected conversation:', conversation.id);
    if (currentSessionId === conversation.id) return;

    setCurrentSessionId(conversation.id);
    setCurrentConversation(conversation);
    setCurrentRequestId(null);
    setResponses({});
    setMergedResponse(null);
    setPrompt('');
    setAttachments([]);
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

  const handleToolSelect = (tool: Tool) => {
    console.log('Tool selected:', tool.name);
    tool.action();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || (!prompt.trim() && attachments.length === 0)) return;

    console.log('=== SUBMIT PROMPT START ===');
    
    setIsLoading(true);
    setResponses({});
    setMergedResponse(null);
    const newRequestId = uuidv4();
    setCurrentRequestId(newRequestId);

    submissionDataRef.current = { 
      prompt, 
      files: attachments
        .filter(att => att.type === 'file' && att.data instanceof File)
        .map(att => att.data as File), 
      selectedAgent 
    };

    console.log('🎯 Submitting with Request ID:', newRequestId);

    try {
      const attachedFilesPayload = [];
      console.log('📂 Uploading attached files:', attachments.length)
      for (const attachment of attachments) {
        if (attachment.type === 'file' && attachment.data instanceof File) {
          const uploaded = await uploadFile(attachment.data);
          attachedFilesPayload.push(uploaded);
        } else if (attachment.type === 'image_base64') {
          attachedFilesPayload.push({
            type: 'image',
            filename: attachment.name,
            temp_path: '',
            size: attachment.size,
            content_type: attachment.contentType,
            data: attachment.data,
          });
        } else if (attachment.type === 'audio_base64') {
          attachedFilesPayload.push({
            type: 'audio',
            filename: attachment.name,
            temp_path: '',
            size: attachment.size,
            content_type: attachment.contentType,
            data: attachment.data,
          });
        } else {
          console.warn('Unknown attachment type:', attachment.type);
        }
      }
      console.log('📂 All files uploaded successfully:', attachedFilesPayload);

      const selectedAgents = selectedAgent.id !== 'merged' ? [selectedAgent.id] : null;

      await submitPrompt(
        prompt,
        currentSessionId,      
        newRequestId,
        selectedAgents,
        attachedFilesPayload
      );

      console.log('✅ Prompt submitted successfully.');
      setPrompt('');
      setAttachments([]);

    } catch (error: any) {
      console.error('❌ Error submitting prompt:', error);
      setMergedResponse({
        content: `Error during submission: ${error.message}`,
        error: error.message
      });
      setPrompt('');
      setAttachments([]);
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        availableAgents={availableAgents}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <SlidingSidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversation?.id || ''}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <SidebarToggle 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          isOpen={isSidebarOpen} 
        />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'md:ml-0'}`}>
          {/* Chat History Area */}
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

          {/* User Input Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              
              {/* Enhanced Tool Dropdown */}
              <div className="mb-4 flex items-center justify-between">
                <ToolDropdown 
                  tools={availableTools}
                  onToolSelect={handleToolSelect}
                />
                
                {/* Quick stats */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {attachments.length > 0 && (
                    <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* File Upload Zone */}
              <FileUploadZone
                files={attachments}
                setFiles={setAttachments}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
              />

              {/* Display for ALL attachments */}
              {attachments.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">Attachments</h4>
                  {attachments.map((att, index) => (
                    <div key={index} className="flex items-center justify-between text-sm animate-in fade-in">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        {att.type === 'image_base64' && <Camera className="w-4 h-4 text-blue-500 flex-shrink-0"/>}
                        {att.type === 'file' && <FileText className="w-4 h-4 text-green-500 flex-shrink-0"/>}
                        {att.type === 'audio_base64' && <Mic className="w-4 h-4 text-purple-500 flex-shrink-0"/>}
                        <span className="truncate">{att.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button 
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt Input Textarea */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Send a message to ${selectedAgent.name}... (Ctrl+Enter to send)`}
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
                    disabled={isLoading || (!prompt.trim() && attachments.length === 0)}
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

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>AetherPro Vision Branch</span>
                  <span>{prompt.length} characters</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <WebcamCapture
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(base64Image) => {
          setAttachments(prev => [
            ...prev,
            {
              type: 'image_base64',
              name: `webcam-capture-${new Date().toISOString()}.jpg`,
              data: base64Image,
              size: (base64Image.length * 3) / 4,
              contentType: 'image/jpeg',
            }
          ]);
        }}
      />
      
      <AudioRecorder
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onCapture={({ base64, blob }) => {
          setAttachments(prev => [
            ...prev,
            {
              type: 'audio_base64',
              name: `audio-recording-${new Date().toISOString()}.wav`,
              data: base64,
              size: blob.size,
              contentType: 'audio/wav',
            }
          ]);
        }}
      />
    </div>
  );
};

export default ConsolePage;