import React, { useState, useRef, useCallback, useEffect } from 'react'; // Added useEffect
import { 
  Send, 
  Paperclip, 
  Download, 
  Copy, 
  Share, 
  History, 
  Settings, 
  Moon, 
  Sun,
  ChevronDown,
  X,
  FileText,
  Code,
  Image,
  Archive,
  Trash2,
  Plus,
  MessageSquare,
  Upload
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

// --- API Configuration ---
// IMPORTANT: Replace with your actual AetherPro API URL
const AETHERPRO_API_BASE_URL = 'https://aetherprotech.com/api/v1'; // Or http://your_vps_ip:8000/api/v1 for dev
const AETHERPRO_WS_BASE_URL = 'wss://aetherprotech.com/ws/chat'; // Or ws://your_vps_ip:8000/ws/chat

// Type definitions for clarity (optional, but good practice)
interface Agent {
  id: string;
  name: string;
  provider?: string;
  status?: string; // 'online', 'offline', 'error'
  description?: string; // from module info
  version?: string; // from module info
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  agent?: string; // Primary agent
  turns: any[]; // Full conversation turns
}

interface LLMResponse {
  content: string;
  version?: string;
  tools?: string[];
  agent_id?: string; // The agent that produced this response
  request_id?: string;
  error?: string;
}

// Header Component
const Header = ({ darkMode, toggleDarkMode, selectedAgent, setSelectedAgent, availableAgents }) => { // Added availableAgents
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AetherPro</h1>
          </div>
          
          {/* Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedAgent.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {agentDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {availableAgents.map((agent: Agent) => ( // Use dynamic agents
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

// Sidebar Component
const Sidebar = ({ conversations, onNewChat, onSelectConversation }) => {
  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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

// File Upload Zone Component
const FileUploadZone = ({ files, setFiles, isDragOver, setIsDragOver }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, [setIsDragOver]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, [setIsDragOver]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [setFiles, setIsDragOver]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.includes('text') || file.name.endsWith('.md')) return <FileText className="w-4 h-4" />;
    if (file.name.endsWith('.json') || file.name.endsWith('.jsonl')) return <Code className="w-4 h-4" />;
    // Add more specific icons if desired, e.g., for .zip, .csv
    if (file.name.endsWith('.zip')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />; // Default fallback
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
          Supports: .txt, .csv, .md, .json, .jsonl, .odt, .zip (file types processed by backend agents vary)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.csv,.md,.json,.jsonl,.odt,.zip,.pdf,.docx,.xlsx" // Expanded common document types
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

// Code Block Component
const CodeBlock = ({ code, language, version, onCopy, onDownload, onPublish }) => {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
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
          <button
            onClick={onCopy}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Download as file"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onPublish}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Publish tool"
          >
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

// Response Tab Component
const ResponseTabs = ({ responses, activeTab, setActiveTab, availableAgents, mergedContent }) => { // Added mergedContent
  const allAgentIds = Array.from(new Set([...Object.keys(responses), 'merged']));
  if (allAgentIds.length === 1 && allAgentIds[0] === 'merged') {
    // Only 'merged' exists, meaning no individual responses yet or only merged.
    // Ensure activeTab is 'merged' if no individual agents responded yet.
    if (Object.keys(responses).length === 0 && mergedContent) {
        if (activeTab !== 'merged') setActiveTab('merged');
    }
  }


  const renderResponseContent = (content: string, responseMeta: LLMResponse) => {
    // Basic markdown code block parsing logic
    return content.split('```').map((part, index) => {
      if (index % 2 === 1) { // This is a code block
        const [lang, ...codeLines] = part.split('\n');
        const code = codeLines.join('\n');
        return (
          <CodeBlock
            key={index}
            code={code}
            language={lang || 'plaintext'} // Default to plaintext if no language specified
            version={responseMeta.version}
            onCopy={() => navigator?.clipboard?.writeText(code)}
            onDownload={() => {
              const blob = new Blob([code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `code.${lang || 'txt'}`;
              a.click();
              URL.revokeObjectURL(url); // Clean up
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
              <div key={agentId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                        {renderResponseContent(mergedContent.content, mergedContent)}
                        {mergedContent.reasoning && <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-2">Reasoning: {mergedContent.reasoning}</p>}
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

// Main Chat Interface Component
const ChatInterface = ({ selectedAgent, availableAgents }) => { // Added availableAgents prop
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({}); // Store individual responses
  const [mergedResponse, setMergedResponse] = useState<LLMResponse | null>(null); // Store the final merged response
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(() => uuidv4()); // Unique for current chat session
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null); // Unique for current prompt

  const websocket = useRef<WebSocket | null>(null);

  // WebSocket connection setup
  useEffect(() => {
    // If WS already exists or we're creating a new chat, close previous WS
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.close();
      websocket.current = null;
    }

    const ws = new WebSocket(`${AETHERPRO_WS_BASE_URL}?session_id=${currentSessionId}`);
    websocket.current = ws;

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WS Message received:', message);

      if (message.type === 'individual_response' && message.request_id === currentRequestId) {
        setResponses(prev => ({
          ...prev,
          [message.agent_id]: {
            content: message.content,
            version: message.version,
            tools: message.tools,
            error: message.error
          }
        }));
        // Optional: auto-switch to the new agent's tab or stay on merged
        // if (Object.keys(responses).length === 0) setActiveTab(message.agent_id);
      } else if (message.type === 'merged_response' && message.request_id === currentRequestId) {
        setMergedResponse({
            content: message.content,
            agent_id: 'merged', // A dummy agent ID for the merged view
            reasoning: message.reasoning,
            error: message.error,
        });
        setIsLoading(false);
        setActiveTab('merged'); // Switch to merged view once complete
      } else if (message.type === 'system_error') {
        console.error('System Error from Backend:', message.error, message.details);
        setIsLoading(false);
        // Display a general error message to the user
      } else if (message.type === 'error' && message.request_id === currentRequestId) {
        console.error('Request-specific Error from Backend:', message.error);
        setIsLoading(false);
        setMergedResponse({
            content: `An error occurred during processing: ${message.error}`,
            agent_id: 'error',
            error: message.error
        });
        setActiveTab('merged');
      }
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (error) => console.error('WebSocket error:', error);

    return () => {
      ws.close();
    };
  }, [currentSessionId, currentRequestId]); // Reconnect if session or request changes

  const setActiveTab = useState('merged')[1]; // Set activeTab state to always be 'merged' initially

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && files.length === 0) return;

    setIsLoading(true);
    setResponses({}); // Clear previous responses
    setMergedResponse(null); // Clear previous merged response
    const newRequestId = uuidv4();
    setCurrentRequestId(newRequestId); // Set current request ID for WebSocket filtering
    setActiveTab('merged'); // Reset tab to merged view or first agent

    // 1. Upload files first
    const uploadedFilePaths: { filename: string; temp_path: string; size: number; content_type: string }[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${AETHERPRO_API_BASE_URL}/upload-file`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          uploadedFilePaths.push({
            filename: data.filename,
            temp_path: data.temp_path,
            size: data.size,
            content_type: data.content_type
          });
          console.log(`Uploaded ${file.name} to ${data.temp_path}`);
        } else {
          console.error(`Failed to upload file ${file.name}:`, response.statusText);
          setIsLoading(false);
          // Handle error, e.g., show a toast notification
          return; // Stop processing if file upload fails
        }
      } catch (error) {
        console.error(`Error during file upload for ${file.name}:`, error);
        setIsLoading(false);
        return; // Stop processing
      }
    }

    // 2. Send prompt via HTTP POST
    try {
      const payload = {
        prompt_text: prompt,
        session_id: currentSessionId,
        request_id: newRequestId, // Pass the request ID
        selected_agents_override: selectedAgent.id !== 'merged' ? [selectedAgent.id] : null,
        attached_files: uploadedFilePaths, // Send the paths of uploaded files
      };

      const response = await fetch(`${AETHERPRO_API_BASE_URL}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting prompt:', errorData.detail || response.statusText);
        setMergedResponse({
            content: `Failed to submit prompt: ${errorData.detail || response.statusText}`,
            agent_id: 'error',
            error: errorData.detail || response.statusText
        });
        setIsLoading(false);
      } else {
        console.log('Prompt submitted successfully.');
        setPrompt(''); // Clear input
        setFiles([]); // Clear files
        // Responses will come via WebSocket
      }
    } catch (error) {
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
    <div className="flex-1 flex flex-col">
      {/* Response Area */}
      <ResponseTabs 
        responses={responses} 
        activeTab={'merged'} // Always default to merged, or implement more sophisticated tab switching
        setActiveTab={setActiveTab} 
        availableAgents={availableAgents}
        mergedContent={mergedResponse} // Pass merged content explicitly
      />

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* File Upload Zone */}
          <div className="mb-4">
            <FileUploadZone 
              files={files}
              setFiles={setFiles}
              isDragOver={isDragOver}
              setIsDragOver={setIsDragOver}
            />
          </div>

          {/* Prompt Input */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Send a message to ${selectedAgent.name}...`}
                className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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

// Main App Component
const AetherPro = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]); // Dynamic agents
  const [selectedAgent, setSelectedAgent] = useState<Agent>({ id: 'merged', name: 'Merged View', status: 'online' }); // Default to a 'merged' agent
  const [conversations, setConversations] = useState<Conversation[]>([]); // Dynamic conversations

  // Fetch available agents/modules on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${AETHERPRO_API_BASE_URL}/modules`);
        if (response.ok) {
          const modules = await response.json();
          // Filter for modules that act as LLM agents. You'll need to define criteria.
          // For now, let's filter for those with 'agent' or 'llm' in their ID or name.
          const agents: Agent[] = modules
            .filter((m: any) => m.state === 'RUNNING' && (m.id.includes('agent') || m.id.includes('llm') || m.id === 'orchestrator' || m.id.includes('planner')))
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              provider: m.id.includes('openai') ? 'OpenAI' : m.id.includes('claude') ? 'Anthropic' : m.id.includes('gemini') ? 'Google' : 'AetherPro',
              status: m.state === 'RUNNING' ? 'online' : 'offline',
              description: m.description,
              version: m.version
            }));
          
          // Add a "Merged View" option that routes to all agents
          const mergedOption: Agent = { id: 'merged', name: 'Merged View', status: 'online', description: 'Orchestrates responses across all active agents.' };
          setAvailableAgents([mergedOption, ...agents]);
          setSelectedAgent(mergedOption); // Set default selected agent to merged view
        } else {
          console.error('Failed to fetch modules:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
    fetchAgents();

    // Fetch conversations (if you implement this endpoint)
    // const fetchConversations = async () => {
    //   try {
    //     const response = await fetch(`${AETHERPRO_API_BASE_URL}/conversations`);
    //     if (response.ok) {
    //       const data = await response.json();
    //       setConversations(data);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching conversations:', error);
    //   }
    // };
    // fetchConversations();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNewChat = () => {
    console.log('Starting new chat...');
    // Reset conversation state in ChatInterface
    // This requires passing a new session_id or a reset function down
  };

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selected conversation:', conversation);
    // Load conversation history into ChatInterface. This requires fetching from API.
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          availableAgents={availableAgents} // Pass dynamic agents
        />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar 
            conversations={conversations} // Use dynamic conversations
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
          />
          
          <ChatInterface 
            selectedAgent={selectedAgent} 
            availableAgents={availableAgents} // Pass dynamic agents to ChatInterface
          />
        </div>
      </div>
    </div>
  );
};

export default AetherPro;