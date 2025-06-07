// pages/ConsolePage.tsx - Fixed to use API service
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
  Upload
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Import your API service instead of hardcoded URLs
import { 
  getModules, 
  submitPrompt, 
  uploadFile, 
  createWebSocketConnection 
} from '../services/api';

// --- Type Definitions ---
interface Agent {
  id: string;
  name: string;
  provider?: string;
  status?: string; 
  description?: string; 
  version?: string; 
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  agent?: string; 
  turns?: any[]; 
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
    <header className="aetherpro-nav px-6 py-4 relative z-40"> {/* Higher z-index for Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AetherPro Console</h1>
          </div>

          {/* Agent Selector - Z-INDEX FIX */}
          <div className="relative z-50"> {/* Higher z-index for dropdown container */}
            <button
              onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedAgent.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {agentDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 aetherpro-modal rounded-lg shadow-lg z-50"> {/* Explicit z-50 */}
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

// --- Sidebar Component (unchanged for this fix) ---
const Sidebar = ({ conversations, onNewChat, onSelectConversation }: {
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}) => {
  return (
    <aside className="w-80 aetherpro-card border-r flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
            Recent Conversations
          </h3>
          {conversations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">No conversations yet.</p>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conv.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {conv.timestamp} {conv.agent && `• ${conv.agent}`}
                    </p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

// --- File Upload Zone Component (unchanged for this fix) ---
const FileUploadZone = ({ files, setFiles, isDragOver, setIsDragOver }: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isDragOver: boolean;
  setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, [setIsDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, [setIsDragOver]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drop files here or <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >browse</button>
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

      {/* File List */}
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

// --- Code Block Component (unchanged for this fix) ---
const CodeBlock = ({ code, language, version, onCopy, onDownload, onPublish }: {
  code: string;
  language: string;
  version?: string;
  onCopy: () => void;
  onDownload: () => void;
  onPublish: () => void;
}) => {
  return (
    <div className="aetherpro-code rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-300">{language}</span>
          {version && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
              {version}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onCopy} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Copy code">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onDownload} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Download as file">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onPublish} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Publish tool">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// --- Response Tab Component (unchanged for this fix) ---
const ResponseTabs = ({ responses, activeTab, setActiveTab, availableAgents, mergedContent }: {
  responses: Record<string, LLMResponse>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableAgents: Agent[];
  mergedContent: LLMResponse | null;
}) => {
  const renderResponseContent = (content: string, responseMeta: LLMResponse) => {
    return content.split('```').map((part, index) => {
      if (index % 2 === 1) {
        const [lang, ...codeLines] = part.split('\n');
        const code = codeLines.join('\n');
        return (
          <CodeBlock
            key={index}
            code={code}
            language={lang || 'plaintext'}
            version={responseMeta.version}
            onCopy={() => navigator?.clipboard?.writeText(code)}
            onDownload={() => {
              const blob = new Blob([code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `code.${lang || 'txt'}`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            onPublish={() => console.log('Publishing tool...')}
          />
        );
      }
      return <div key={index} className="whitespace-pre-wrap">{part}</div>;
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {Object.keys(responses).map(agentId => {
          const agent = availableAgents.find((a: Agent) => a.id === agentId);
          return (
            <button
              key={agentId}
              onClick={() => setActiveTab(agentId)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === agentId
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {agent?.name || agentId}
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('merged')}
          className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'merged'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Merged View
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'merged' ? (
          <div className="space-y-6">
            {Object.keys(responses).length === 0 && !mergedContent && (
                <p className="text-gray-500 dark:text-gray-400 italic">No responses yet. Start a conversation!</p>
            )}
            {Object.entries(responses).map(([agentId, response]: [string, LLMResponse]) => (
              <div key={agentId} className="dashboard-card rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {availableAgents.find((a: Agent) => a.id === agentId)?.name || agentId} Response
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  {response.error ? (
                    <p className="text-red-500 dark:text-red-400">Error: {response.error}</p>
                  ) : (
                    renderResponseContent(response.content, response)
                  )}
                </div>
              </div>
            ))}
            {mergedContent && (
                <div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        Orchestrated/Merged Response
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                        {mergedContent.content && renderResponseContent(mergedContent.content, mergedContent)}
                        {mergedContent.reasoning && <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-2">Reasoning: {mergedContent.reasoning}</p>}
                        {mergedContent.error && <p className="text-red-500 dark:text-red-400 mt-2">Error: {mergedContent.error}</p>}
                    </div>
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              {responses[activeTab] ? (
                responses[activeTab].error ? (
                  <p className="text-red-500 dark:text-red-400">Error: {responses[activeTab].error}</p>
                ) : (
                  renderResponseContent(responses[activeTab].content, responses[activeTab])
                )
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No response for this agent yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Chat Interface Component (Updated to use API service) ---
const ChatInterface = ({
  selectedAgent,
  availableAgents,
  currentSessionId,
  currentRequestId,
  setCurrentRequestId,
  responses,
  setResponses,
  mergedResponse,
  setMergedResponse,
  prompt,
  setPrompt,
}: {
  selectedAgent: Agent;
  availableAgents: Agent[];
  currentSessionId: string;
  currentRequestId: string | null;
  setCurrentRequestId: (id: string | null) => void;
  responses: Record<string, LLMResponse>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, LLMResponse>>>;
  mergedResponse: LLMResponse | null;
  setMergedResponse: React.Dispatch<React.SetStateAction<LLMResponse | null>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const websocket = useRef<WebSocket | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const responsesRef = useRef<Record<string, LLMResponse>>({});
  const mergedResponseRef = useRef<LLMResponse | null>(null);
  const setIsLoadingRef = useRef<React.Dispatch<React.SetStateAction<boolean>>>(() => {});
  const setResponsesRef = useRef<React.Dispatch<React.SetStateAction<Record<string, LLMResponse>>>>(() => {});
  const setMergedResponseRef = useRef<React.Dispatch<React.SetStateAction<LLMResponse | null>>>(() => {});

  // Keep refs updated
  useEffect(() => { currentRequestIdRef.current = currentRequestId; }, [currentRequestId]);
  useEffect(() => { responsesRef.current = responses; }, [responses]);
  useEffect(() => { mergedResponseRef.current = mergedResponse; }, [mergedResponse]);
  useEffect(() => { setIsLoadingRef.current = setIsLoading; }, [setIsLoading]);
  useEffect(() => { setResponsesRef.current = setResponses; }, [setResponses]);
  useEffect(() => { setMergedResponseRef.current = setMergedResponse; }, [setMergedResponse]);

  // WebSocket connection setup using API service
  useEffect(() => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.close();
      websocket.current = null;
    }

    if (!currentSessionId) {
      console.warn("No currentSessionId, delaying WebSocket connection.");
      return;
    }

    // Use API service WebSocket helper
    interface WebSocketMessageBase {
      type: string;
      request_id?: string;
      agent_id?: string;
      error?: string;
      details?: any;
    }

    interface IndividualResponseMessage extends WebSocketMessageBase {
      type: 'individual_response';
      request_id: string;
      agent_id: string;
      content: string;
      version?: string;
      tools?: string[];
      error?: string;
    }

    interface MergedResponseMessage extends WebSocketMessageBase {
      type: 'merged_response';
      request_id: string;
      content: string;
      reasoning?: string;
      error?: string;
    }

    interface SystemErrorMessage extends WebSocketMessageBase {
      type: 'system_error';
      error: string;
      details?: any;
    }

    interface RequestErrorMessage extends WebSocketMessageBase {
      type: 'error';
      request_id: string;
      error: string;
    }

    type WebSocketMessage =
      | IndividualResponseMessage
      | MergedResponseMessage
      | SystemErrorMessage
      | RequestErrorMessage
      | WebSocketMessageBase;

    websocket.current = createWebSocketConnection(
      currentSessionId,
      (message: WebSocketMessage) => {
        console.log('WS Message received:', message);
        console.log('Current Request ID (frontend state - from ref):', currentRequestIdRef.current);
        console.log('Message Request ID (from backend):', message.request_id);

        if (message.type === 'individual_response' && message.request_id === currentRequestIdRef.current) {
          setResponsesRef.current((prev: Record<string, LLMResponse>) => {
            const newResponses = { ...prev };
            newResponses[message.agent_id as string] = {
              content: (message as IndividualResponseMessage).content,
              version: (message as IndividualResponseMessage).version,
              tools: (message as IndividualResponseMessage).tools,
              error: message.error
            };
            console.log('Updating individual responses:', newResponses);
            return newResponses;
          });
          setIsLoadingRef.current(true);
        } else if (message.type === 'merged_response' && message.request_id === currentRequestIdRef.current) {
          setMergedResponseRef.current({
              content: (message as MergedResponseMessage).content,
              agent_id: 'merged',
              reasoning: (message as MergedResponseMessage).reasoning,
              error: message.error,
          });
          setIsLoadingRef.current(false);
          console.log('Updating merged response and setting isLoading to false.');
        } else if (message.type === 'system_error') {
          console.error('System Error from Backend:', message.error, message.details);
          setIsLoadingRef.current(false);
          setMergedResponseRef.current({
            content: `A system error occurred: ${message.error || 'Unknown error'}`,
            agent_id: 'system_error',
            error: message.error,
            reasoning: JSON.stringify(message.details || {})
          });
        } else if (message.type === 'error' && message.request_id === currentRequestIdRef.current) {
          console.error('Request-specific Error from Backend:', message.error);
          setIsLoadingRef.current(false);
          setMergedResponseRef.current({
              content: `An error occurred during processing: ${message.error}`,
              agent_id: 'request_error',
              error: message.error
          });
        } else {
            console.warn("WS Message received but not processed (ID mismatch or unexpected type):", message, "Frontend ReqID:", currentRequestIdRef.current);
        }
      },
      (error: Event) => console.error('WebSocket error:', error),
      (event: CloseEvent) => console.log('WebSocket closed:', event.code, event.reason)
    );

    return () => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        websocket.current.close();
      }
    };
  }, [currentSessionId]);

  const [activeTab, setActiveTab] = useState('merged');

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && files.length === 0) return;

    setIsLoading(true);
    setResponses({});
    setMergedResponse(null);
    const newRequestId = uuidv4();
    setCurrentRequestId(newRequestId);
    currentRequestIdRef.current = newRequestId;
    setActiveTab('merged');

    try {
      // 1. Upload files using API service
      const uploadedFilePaths: { filename: string; temp_path: string; size: number; content_type: string }[] = [];
      for (const file of files) {
        try {
          const data = await uploadFile(file);
          uploadedFilePaths.push({
            filename: data.filename,
            temp_path: data.temp_path,
            size: data.size,
            content_type: data.content_type
          });
          console.log(`Uploaded ${file.name} to ${data.temp_path}`);
        } catch (error: any) {
          console.error(`Error during file upload for ${file.name}:`, error);
          setMergedResponse({ content: `Error during file upload: ${error.message}`, error: error.message });
          setIsLoading(false);
          return;
        }
      }

      // 2. Send prompt using API service
      console.log('Submitting prompt:', prompt);
      console.log('Current Session ID:', currentSessionId);
      console.log('Current Request ID:', newRequestId);
      console.log('Selected Agent:', selectedAgent);
      console.log('Uploaded File Paths:', uploadedFilePaths);

      const selectedAgents = selectedAgent.id !== 'merged' ? [selectedAgent.id] : null;

      // FIX: Ensure currentSessionId is treated as string for the API call
      await submitPrompt(
        prompt,
        currentSessionId as string, // Cast to string to satisfy type if it's strictly string
        selectedAgents,
        newRequestId,
        uploadedFilePaths
      );

      console.log('Prompt submitted successfully. Waiting for WebSocket responses.');
      setPrompt('');
      setFiles([]);
      // Responses will come via WebSocket, isLoading remains true until merged_response

    } catch (error: any) {
      console.error('Network or unexpected error submitting prompt:', error);
      setMergedResponse({
          content: `Network or unexpected error: ${error.message}`,
          agent_id: 'error',
          error: error.message
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto console-container">
      <ResponseTabs
        responses={responses}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableAgents={availableAgents}
        mergedContent={mergedResponse}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 p-6 aetherpro-card">
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
                className="aetherpro-input w-full p-4 pr-12 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!prompt.trim() && files.length === 0)}
                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Send className="w-4 h-4" />}
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
  );
};

// --- Main Console Component ---
const ConsolePage = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent>({ id: 'merged', name: 'Merged View', status: 'online' });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // States for chat interface
  const [currentSessionId, setCurrentSessionId] = useState(() => uuidv4());
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({});
  const [mergedResponse, setMergedResponse] = useState<LLMResponse | null>(null);
  const [prompt, setPrompt] = useState('');

  // Fetch available agents/modules using API service
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const modules = await getModules();
        
        // Filter for modules that act as LLM agents and are running
        const agents: Agent[] = modules
          .filter((m: any) => m.state === 'RUNNING' && (m.id.includes('agent') || m.id.includes('llm') || m.id === 'orchestrator' || m.id.includes('planner') || m.id.includes('structured_content_agent'))) // Added structured_content_agent
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

        // Add merged view option
        const mergedOption: Agent = { 
          id: 'merged', 
          name: 'Merged View', 
          status: 'online', 
          description: 'Orchestrates responses across all active agents.' 
        };
        
        setAvailableAgents([mergedOption, ...agents]);
        setSelectedAgent(mergedOption);
      } catch (error) {
        console.error('Error fetching modules:', error);
        // Set fallback agents if API call fails
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
    // Update the document class for global dark mode
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleNewChat = () => {
    console.log('Starting new chat...');
    setCurrentSessionId(uuidv4());
    setCurrentRequestId(null);
    setResponses({});
    setMergedResponse(null);
    setPrompt('');
  };

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selected conversation:', conversation);
    setCurrentSessionId(conversation.id);
    setCurrentRequestId(null);
    setResponses({});
    setMergedResponse(null);
    setPrompt('');
  };

  // Set initial dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('theme-transition'); // Apply transition on initial load
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('theme-transition'); // Remove transition on initial load if light
    }
    // Set a timeout to remove the transition class after the initial load
    // This prevents the transition from firing on every subsequent state change unrelated to theme
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500); // Match your transition duration

    return () => clearTimeout(timer); // Cleanup timeout
  }, []); // Empty dependency array means this runs once on mount


  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col`}> {/* Set flex-col here */}
      {/* Header takes fixed height */}
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        availableAgents={availableAgents}
      />

      {/* Main content area: flex-1 to take remaining height, flex container */}
      <div className="flex-1 flex overflow-hidden"> {/* overflow-hidden on this flex-1 parent */}
        {/* Sidebar takes fixed width */}
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />

        {/* Chat Interface: flex-1 to take remaining width, flex-col for its own content */}
        <div className="flex-1 flex flex-col overflow-hidden"> {/* overflow-hidden here */}
          <ChatInterface
            selectedAgent={selectedAgent}
            availableAgents={availableAgents}
            currentSessionId={currentSessionId}
            currentRequestId={currentRequestId}
            setCurrentRequestId={setCurrentRequestId}
            responses={responses}
            setResponses={setResponses}
            mergedResponse={mergedResponse}
            setMergedResponse={setMergedResponse}
            prompt={prompt}
            setPrompt={setPrompt}
          />
        </div>
      </div>
    </div>
  );
};

export default ConsolePage;