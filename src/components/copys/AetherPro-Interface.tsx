import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { Agent, Conversation, LLMResponse } from '../types';

const AETHERPRO_API_BASE_URL = 'http://localhost:8000/api/v1';
const AETHERPRO_WS_BASE_URL = 'ws://localhost:8000/ws/chat';

const AetherProInterface = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent>({
    id: 'merged',
    name: 'Merged View',
    status: 'online',
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [currentSessionId, setCurrentSessionId] = useState(() => uuidv4());
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({});
  const [mergedResponse, setMergedResponse] = useState<LLMResponse | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${AETHERPRO_API_BASE_URL}/modules`);
        if (response.ok) {
          const modules = await response.json();
          const agents: Agent[] = modules
            .filter((m: any) =>
              m.state === 'RUNNING' &&
              (m.id.includes('agent') || m.id.includes('llm') || m.id === 'orchestrator' || m.id.includes('planner'))
            )
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              provider: m.id.includes('openai')
                ? 'OpenAI'
                : m.id.includes('claude')
                ? 'Anthropic'
                : m.id.includes('gemini')
                ? 'Google'
                : 'AetherPro',
              status: m.state === 'RUNNING' ? 'online' : 'offline',
              description: m.description,
              version: m.version,
            }));

          const mergedOption: Agent = {
            id: 'merged',
            name: 'Merged View',
            status: 'online',
            description: 'Orchestrates responses across all active agents.',
          };

          setAvailableAgents([mergedOption, ...agents]);
          setSelectedAgent(mergedOption);
        } else {
          console.error('Failed to fetch modules:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    fetchAgents();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
    // Future implementation to load conversation history
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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
          />

          <div className="flex-1 flex flex-col overflow-y-auto">
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
    </div>
  );
};

export default AetherProInterface;