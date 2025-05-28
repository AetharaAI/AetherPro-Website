// src/pages/ChatPage.jsx
import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import useChatStore from '../store/chatStore';
import { Button } from '@/components/ui/button'; // shadcn/ui

const ChatPage = () => {
  const startNewSession = useChatStore((state) => state.startNewSession);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height based on Navbar/Footer */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">AetherPro Chat</h1>
        <Button onClick={startNewSession} variant="outline">New Session</Button>
      </div>
      <ChatWindow />
      <ChatInput />
      {/* Later, add AgentSelectorToggle here or within ChatInput area */}
    </div>
  );
};

export default ChatPage;