// --- START OF FILE: src/pages/ConsolePage.tsx (COMPLETE, RESTORED, AND FIXED) ---

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Send, Menu, Plus, MessageSquare, Upload, Trash2, Edit3, Camera, Mic, Search,
  Globe, Calculator, Zap, X, ChevronDown, ChevronLeft, Sun, Moon, Settings,
  FileText, Code, Image, Archive, Copy
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

// Component imports
import AudioRecorder from '../components/AudioRecorder';
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

// --- TYPE DEFINITIONS ---
interface Attachment {
  type: 'file' | 'image_base64' | 'video' | 'audio_base64';
  name: string;
  data: File | string;
  size: number;
  contentType: string;
}
interface Agent {
  id: string; name: string; provider?: string; status?: string; description?: string; version?: string;
}
interface ChatTurn {
  id: string; timestamp: string; prompt: string;
  files?: { filename: string; size: number; content_type: string }[];
  responses: Record<string, LLMResponse>;
  mergedResponse: LLMResponse | null;
  selectedAgent: Agent;
}
interface Conversation {
  id: string; title: string; timestamp: string; lastUpdated: string; agent?: string; turns: ChatTurn[]; userId?: string;
}
interface LLMResponse {
  content: string; version?: string; tools?: string[]; agent_id?: string; request_id?: string; error?: string; reasoning?: string; source_agents?: string[];
}
interface Tool {
  id: string; name: string; icon: React.ComponentType<any>; description: string; action: () => void; disabled?: boolean;
}

// --- API & HELPER FUNCTIONS ---
const conversationAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/conversations', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
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
      const response = await fetch('/api/conversations', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(conversation) });
      if (!response.ok) throw new Error('Failed to save conversation');
    } catch (error) {
      console.error('Error saving conversation:', error);
      const stored = localStorage.getItem('aetherpro_conversations');
      const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) { conversations[existingIndex] = conversation; } else { conversations.unshift(conversation); }
      localStorage.setItem('aetherpro_conversations', JSON.stringify(conversations));
    }
  },
  deleteConversation: async (conversationId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
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
      const response = await fetch(`/api/conversations/${conversationId}/title`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
      if (!response.ok) throw new Error('Failed to update conversation title');
    } catch (error) {
      console.error('Error updating conversation title:', error);
      const conversations: Conversation[] = await conversationAPI.getConversations();
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) { conversation.title = title; conversation.lastUpdated = new Date().toISOString(); }
      localStorage.setItem('aetherpro_conversations', JSON.stringify(conversations));
    }
  }
};

const generateConversationTitle = (prompt: string): string => {
  const words = prompt.trim().split(/\s+/).slice(0, 6);
  const title = words.join(' ');
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

// --- INTEGRATED COMPONENTS ---

const SlidingSidebar = ({
  conversations, onNewChat, onSelectConversation, currentConversationId,
  onDeleteConversation, onRenameConversation, isOpen, onToggle
}: {
  conversations: Conversation[]; onNewChat: () => void; onSelectConversation: (conversation: Conversation) => void;
  currentConversationId: string; onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void; isOpen: boolean; onToggle: () => void;
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

    const handleStartEdit = (conversation: Conversation) => { setEditingId(conversation.id); setEditTitle(conversation.title); };
    const handleSaveEdit = (conversationId: string) => { if (editTitle.trim()) { onRenameConversation(conversationId, editTitle.trim()); } setEditingId(null); setEditTitle(''); };
    const handleCancelEdit = () => { setEditingId(null); setEditTitle(''); };
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString); const now = new Date(); const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      if (diffInHours < 1) { return 'Just now'; } else if (diffInHours < 24) { return `${Math.floor(diffInHours)}h ago`; } else if (diffInHours < 168) { return date.toLocaleDateString([], { weekday: 'short' }); } else { return date.toLocaleDateString([], { month: 'short', day: 'numeric' }); }
    };
    const filteredConversations = conversations.filter(conv => conv.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const groupedConversations = filteredConversations.reduce((acc, conv) => {
      const groupKey = formatDate(conv.lastUpdated); if (!acc[groupKey]) { acc[groupKey] = []; } acc[groupKey].push(conv); return acc;
    }, {} as Record<string, Conversation[]>);

    return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onToggle} />}
        <aside className={`fixed left-0 top-0 h-full z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:relative flex flex-col flex-shrink-0 ${isOpen ? 'translate-x-0 w-full md:w-80' : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:border-r-0'}`}>
          <div className={`flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-2"><img src="/aether-logo.png" alt="AetherPro Logo" className="w-6 h-6 object-contain" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">AetherPro</h2></div><button onClick={onToggle} className="md:hidden p-2 text-gray-500 rounded-lg"><X className="w-5 h-5" /></button></div>
            <button onClick={() => { onNewChat(); if (window.innerWidth < 768) onToggle(); }} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"><Plus className="w-4 h-4" /><span>New Chat</span></button>
            {conversations.length > 0 && (<div className="relative mt-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" /></div>)}
          </div>
          <div className={`flex-1 overflow-y-auto py-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            {filteredConversations.length === 0 ? (<div className="text-center text-gray-500 p-4"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No conversations yet.</p></div>) : Object.entries(groupedConversations).map(([groupTitle, groupConversations]) => (<div key={groupTitle} className="mb-6"><h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-3">{groupTitle}</h3><div className="space-y-1">{groupConversations.map((conv) => (<div key={conv.id} className={`relative group mx-2 rounded-lg ${conv.id === currentConversationId ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} onMouseEnter={() => setHoveredConversation(conv.id)} onMouseLeave={() => setHoveredConversation(null)}><div onClick={() => { onSelectConversation(conv); if (window.innerWidth < 768) onToggle(); }} className="w-full text-left p-3 rounded-lg cursor-pointer"><div className="flex items-start justify-between"><div className="flex-1 min-w-0 pr-2">{editingId === conv.id ? (<input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => handleSaveEdit(conv.id)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleSaveEdit(conv.id); if (e.key === 'Escape') handleCancelEdit(); }} className="w-full bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm font-medium" autoFocus onClick={(e) => e.stopPropagation()} />) : (<h4 className="text-sm font-medium text-gray-900 dark:text-white truncate leading-5">{conv.title}</h4>)}<div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1"><span>{formatDate(conv.lastUpdated)}</span>{conv.turns.length > 0 && (<><span>•</span><span>{conv.turns.length} msg</span></>)}</div></div>{(hoveredConversation === conv.id || conv.id === currentConversationId) && (<div className="flex items-center"><button onClick={(e) => { e.stopPropagation(); handleStartEdit(conv); }} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) onDeleteConversation(conv.id); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></div>)}</div></div></div>))}</div></div>))}
          </div>
          <div className={`flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}><div className="text-xs text-gray-500 dark:text-gray-400 text-center">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</div></div>
        </aside>
      </>
    );
};

const Header = ({ darkMode, toggleDarkMode, selectedAgent, setSelectedAgent, availableAgents, onToggleSidebar }: {
  darkMode: boolean; toggleDarkMode: () => void; selectedAgent: Agent; setSelectedAgent: (agent: Agent) => void; availableAgents: Agent[]; onToggleSidebar: () => void;
}) => {
    const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
    return (
      <header className="aetherpro-nav px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={onToggleSidebar} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2"><img src="/aether-logo.png" alt="AetherPro Logo" className="w-8 h-8 object-contain hidden sm:block" /><h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">AetherPro</h1></div>
            <div className="relative z-50"><button onClick={() => setAgentDropdownOpen(!agentDropdownOpen)} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="text-sm font-medium">{selectedAgent.name}</span><ChevronDown className="w-4 h-4" /></button>{agentDropdownOpen && (<div className="absolute top-full left-0 mt-2 w-64 aetherpro-modal rounded-lg shadow-lg z-50">{availableAgents.map((agent) => (<button key={agent.id} onClick={() => { setSelectedAgent(agent); setAgentDropdownOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"><div className="flex items-center space-x-3"><div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div><div><div className="font-medium">{agent.name}</div><div className="text-xs text-gray-500">{agent.provider || 'N/A'}</div></div></div><span className={`text-xs px-2 py-1 rounded ${agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{agent.status}</span></button>))}</div>)}</div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-3">
            <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
    );
};

const ChatHistory = ({ conversation, availableAgents }: { conversation: Conversation | null; availableAgents: Agent[]; }) => {
    if (!conversation || conversation.turns.length === 0) return (<div className="flex-1 flex items-center justify-center text-gray-500"><div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Start a new conversation.</p></div></div>);
    const renderResponseContent = (content: string) => content.split('```').map((part, index) => {
      if (index % 2 === 1) { const [lang, ...codeLines] = part.split('\n'); const code = codeLines.join('\n'); return (<div key={index} className="aetherpro-code rounded-lg overflow-hidden my-4"><div className="flex items-center justify-between px-4 py-2 bg-gray-800"><span className="text-sm text-gray-300">{lang || 'code'}</span><button onClick={() => navigator.clipboard.writeText(code)} className="p-1.5 text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button></div><pre className="p-4 text-sm overflow-x-auto"><code>{code}</code></pre></div>); }
      return <div key={index} className="whitespace-pre-wrap">{part}</div>;
    });
    return (<div className="flex-1 space-y-6 p-6">{conversation.turns.map((turn, index) => (<div key={turn.id} className="space-y-4"><div className="flex justify-end"><div className="max-w-3xl bg-blue-600 text-white rounded-lg p-4"><div className="whitespace-pre-wrap">{turn.prompt}</div>{turn.files && turn.files.length > 0 && (<div className="mt-2 pt-2 border-t border-blue-500">{turn.files.map((file, i) => (<div key={i} className="text-xs">📎 {file.filename}</div>))}</div>)}<div className="text-xs text-blue-200 mt-2">{new Date(turn.timestamp).toLocaleString()}</div></div></div><div className="space-y-3">{Object.entries(turn.responses).map(([agentId, response]) => { const agent = availableAgents.find(a => a.id === agentId); return (<div key={agentId} className="dashboard-card rounded-lg p-4"><h4 className="font-semibold mb-3 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>{agent?.name || agentId}</h4><div className="prose dark:prose-invert max-w-none">{response.error ? <p className="text-red-500">Error: {response.error}</p> : renderResponseContent(response.content)}</div></div>);})}{turn.mergedResponse && (<div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20"><h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">🔮 Orchestrated Response</h4><div className="prose dark:prose-invert max-w-none">{turn.mergedResponse.error ? <p className="text-red-500">Error: {turn.mergedResponse.error}</p> : renderResponseContent(turn.mergedResponse.content)}</div></div>)}</div>{index < conversation.turns.length - 1 && <hr className="border-gray-200 dark:border-gray-700" />}</div>))}</div>);
};

const FileUploadZone = ({ files, setFiles, isDragOver, setIsDragOver }: { files: Attachment[]; setFiles: React.Dispatch<React.SetStateAction<Attachment[]>>; isDragOver: boolean; setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>; }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, [setIsDragOver]);
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, [setIsDragOver]);
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const newAttachments: Attachment[] = Array.from(e.dataTransfer.files).map(file => ({ type: 'file', name: file.name, data: file, size: file.size, contentType: file.type, })); setFiles(prev => [...prev, ...newAttachments]); }, [setFiles, setIsDragOver]);
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const newAttachments: Attachment[] = Array.from(e.target.files || []).map(file => ({ type: 'file', name: file.name, data: file, size: file.size, contentType: file.type, })); setFiles(prev => [...prev, ...newAttachments]); };
    const getFileIcon = (file: Attachment) => { if (file.contentType.startsWith('image/')) return <Image className="w-4 h-4" />; if (file.contentType.includes('text')) return <FileText className="w-4 h-4" />; if (file.name.endsWith('.json')) return <Code className="w-4 h-4" />; if (file.name.endsWith('.zip')) return <Archive className="w-4 h-4" />; return <FileText className="w-4 h-4" />; };
    return (<div className="space-y-3"><div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600 dark:text-gray-400">Drop files here or <span className="text-blue-600 font-medium">browse</span></p><input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".txt,.csv,.md,.json,.jsonl,.odt,.zip,.pdf,.docx,.xlsx" /></div>{files.length > 0 && (<div className="space-y-2">{files.map((file, index) => (<div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"><div className="flex items-center space-x-2">{getFileIcon(file)}<span className="text-sm truncate">{file.name}</span><span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span></div><button onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button></div>))}</div>)}</div>);
};

const ToolDropdown = ({ tools, onToolSelect }: { tools: Tool[]; onToolSelect: (tool: Tool) => void; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
    return (<div className="relative" ref={dropdownRef}><button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><Zap className="w-4 h-4" /><span>Tools</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 py-1">{tools.map((tool) => (<button key={tool.id} onClick={() => { if (!tool.disabled) { onToolSelect(tool); setIsOpen(false); } }} disabled={tool.disabled} className={`w-full flex items-start space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left ${tool.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}><tool.icon className="w-5 h-5 text-gray-500 mt-0.5" /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{tool.name}</div><div className="text-xs text-gray-500 mt-0.5">{tool.description}</div></div></button>))}</div>)}</div>);
};

// --- MAIN CONSOLE PAGE COMPONENT ---
const ConsolePage = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent>({ id: 'merged', name: 'Merged View', status: 'online' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const availableTools: Tool[] = [
    { id: 'camera', name: 'Camera', icon: Camera, description: 'Capture images from your camera', action: () => setIsWebcamOpen(true) },
    { id: 'microphone', name: 'Microphone', icon: Mic, description: 'Record audio messages', action: () => setIsAudioModalOpen(true) },
    { id: 'web-search', name: 'Web Search', icon: Search, description: 'Search the web for information', action: () => { }, disabled: true },
    { id: 'calculator', name: 'Calculator', icon: Calculator, description: 'Perform mathematical calculations', action: () => { }, disabled: true },
    { id: 'browser', name: 'Browser', icon: Globe, description: 'Browse websites and extract content', action: () => { }, disabled: true }
  ];
  
  // --- All existing hooks and handlers from your original file ---
  useEffect(() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  
  const addTurnToConversation = useCallback((turnPrompt, turnFiles, turnResponses, turnMergedResponse, turnSelectedAgent) => {
    const turn = { id: uuidv4(), timestamp: new Date().toISOString(), prompt: turnPrompt, files: turnFiles.map(f => ({ filename: f.name, size: f.size, content_type: f.type })), responses: turnResponses, mergedResponse: turnMergedResponse, selectedAgent: turnSelectedAgent };
    setCurrentConversation(prev => prev ? { ...prev, turns: [...prev.turns, turn], lastUpdated: new Date().toISOString() } : { id: currentSessionId, title: generateConversationTitle(turnPrompt), timestamp: new Date().toISOString(), lastUpdated: new Date().toISOString(), agent: turnSelectedAgent.name, turns: [turn], userId: user?.id });
  }, [currentSessionId, user?.id]);

  const saveCurrentConversation = useCallback(async (convToSave: Conversation) => {
    if (!convToSave) return;
    await conversationAPI.saveConversation(convToSave);
    setConversations(prev => { const idx = prev.findIndex(c => c.id === convToSave.id); if (idx > -1) { const u = [...prev]; u[idx] = convToSave; return u; } return [convToSave, ...prev]; });
  }, []);

  useEffect(() => { if (currentConversation?.turns.length) { const t = setTimeout(() => saveCurrentConversation(currentConversation), 1000); return () => clearTimeout(t); } }, [currentConversation, saveCurrentConversation]);
  useEffect(() => { currentRequestIdRef.current = currentRequestId; }, [currentRequestId]);
  useEffect(() => { responsesRef.current = responses; }, [responses]);

  useEffect(() => {
    if (websocket.current) websocket.current.close();
    if (!currentSessionId) return;
    websocket.current = createWebSocketConnection(currentSessionId, (message) => {
      if (message.type === 'ping') {
        console.log('📨 Ping received, sending pong...');
        websocket.current?.send(JSON.stringify({ type: 'pong', currentSessionId}));
        return;
      }
      if (message.request_id !== currentRequestIdRef.current) return;
      if (message.type === 'individual_response') { const msg = message as IndividualResponseMessage; setResponses(p => ({ ...p, [msg.agent_id]: { content: msg.content, error: msg.error } })); }
      else if (message.type === 'merged_response') { const msg = message as MergedResponseMessage; const mergedResp = { content: msg.content, error: msg.error, reasoning: msg.reasoning }; setMergedResponse(mergedResp); setIsLoading(false); if (submissionDataRef.current) addTurnToConversation(submissionDataRef.current.prompt, submissionDataRef.current.files, responsesRef.current, mergedResp, submissionDataRef.current.selectedAgent); }
      else if (message.type === 'system_error') { const errorResponse = { content: `System Error: ${message.error}`, error: message.error }; setMergedResponse(errorResponse); setIsLoading(false); if (submissionDataRef.current) addTurnToConversation(submissionDataRef.current.prompt, submissionDataRef.current.files, responsesRef.current, errorResponse, submissionDataRef.current.selectedAgent); }
    }, console.error, console.log);
    return () => { if (websocket.current) websocket.current.close(); };
  }, [currentSessionId, addTurnToConversation]);

  useEffect(() => {
    const fetchAgents = async () => {
      try { const modules = await getModules(); const agents = modules.filter(m => m.state === 'RUNNING' && (m.id.includes('agent') || m.id.includes('llm'))).map(m => ({ id: m.id, name: m.name, provider: m.id.includes('openai') ? 'OpenAI' : m.id.includes('claude') ? 'Anthropic' : m.id.includes('gemini') ? 'Google' : 'Other', status: 'online', description: m.description, version: m.version })); setAvailableAgents([{ id: 'merged', name: 'Merged View', status: 'online', description: 'Orchestrated response' }, ...agents]); } catch (e) { console.error(e) }
    };
    const loadConversations = async () => setConversations(await conversationAPI.getConversations());
    fetchAgents(); loadConversations();
  }, []);

  const handleNewChat = () => { setCurrentSessionId(uuidv4()); setCurrentConversation(null); setPrompt(''); setAttachments([]); setIsLoading(false); setResponses({}); setMergedResponse(null); setCurrentRequestId(null); submissionDataRef.current = null;};
  const handleSelectConversation = (c: Conversation) => { if (currentConversation?.id === c.id) return; setCurrentSessionId(c.id); setCurrentConversation(c); setPrompt(''); setAttachments([]); setIsLoading(false); setResponses({}); setMergedResponse(null); };
  const handleDeleteConversation = async (id: string) => { await conversationAPI.deleteConversation(id); setConversations(p => p.filter(c => c.id !== id)); if (currentConversation?.id === id) handleNewChat(); };
  const handleRenameConversation = async (id: string, title: string) => { await conversationAPI.updateConversationTitle(id, title); setConversations(p => p.map(c => c.id === id ? { ...c, title, lastUpdated: new Date().toISOString() } : c)); if (currentConversation?.id === id) setCurrentConversation(p => p ? { ...p, title } : null); };
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const handleToolSelect = (tool: Tool) => tool.action();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || (!prompt.trim() && attachments.length === 0)) return;
    setIsLoading(true); setResponses({}); setMergedResponse(null);
    const newRequestId = uuidv4(); setCurrentRequestId(newRequestId);
    submissionDataRef.current = { prompt, files: attachments.filter(a => a.type === 'file').map(a => a.data as File), selectedAgent };
    try {
      const attachedFilesPayload = await Promise.all(attachments.map(att => (att.type === 'file' && att.data instanceof File) ? uploadFile(att.data) : Promise.resolve({ type: att.type.split('_')[0], filename: att.name, size: att.size, contentType: att.contentType, data: att.data })));
      await submitPrompt(prompt, currentSessionId, newRequestId, selectedAgent.id !== 'merged' ? [selectedAgent.id] : null, attachedFilesPayload);
      setPrompt(''); setAttachments([]);
    } catch (error: any) { setMergedResponse({ content: `Error: ${error.message}`, error: error.message }); setIsLoading(false); }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>
      <div className="flex h-full w-full relative">
        <SlidingSidebar
          conversations={conversations} onNewChat={handleNewChat} onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversation?.id || ''} onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out`}>
          <Header
            darkMode={darkMode} toggleDarkMode={toggleDarkMode} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent}
            availableAgents={availableAgents} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ChatHistory conversation={currentConversation} availableAgents={availableAgents} />
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex items-center justify-between">
                  <ToolDropdown tools={availableTools} onToolSelect={handleToolSelect} />
                </div>
                <FileUploadZone files={attachments} setFiles={setAttachments} isDragOver={isDragOver} setIsDragOver={setIsDragOver} />
                {attachments.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-500">Attachments</h4>
                    {attachments.map((att, index) => (
                      <div key={index} className="flex items-center justify-between text-sm animate-in fade-in">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {att.type === 'image_base64' && <Camera className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                          {att.type === 'file' && <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          {att.type === 'audio_base64' && <Mic className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                          <span className="truncate">{att.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="relative">
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={`Send a message to ${selectedAgent.name}... (Ctrl+Enter to send)`} className="aetherpro-input w-full p-4 pr-12 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800" rows={4} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e); }} disabled={isLoading} />
                    <button onClick={handleSubmit} disabled={isLoading || (!prompt.trim() && attachments.length === 0)} className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><span>AetherPro Vision Branch</span><span>{prompt.length} characters</span></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <WebcamCapture isOpen={isWebcamOpen} onClose={() => setIsWebcamOpen(false)} onCapture={(base64Image) => setAttachments(p => [...p, { type: 'image_base64', name: `webcam-${Date.now()}.jpg`, data: base64Image, size: base64Image.length, contentType: 'image/jpeg' }])} />
      <AudioRecorder isOpen={isAudioModalOpen} onClose={() => setIsAudioModalOpen(false)} onCapture={({ base64, blob }) => setAttachments(p => [...p, { type: 'audio_base64', name: `recording-${Date.now()}.wav`, data: base64, size: blob.size, contentType: 'audio/wav' }])} />
    </div>
  );
};

export default ConsolePage;