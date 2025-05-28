// src/pages/ChatPage.jsx
import React from 'react';
import ChatInput from '../components/chat/ChatInput';
import ChatWindow from '../components/chat/ChatWindow';
import AgentSelectorToggle from '../components/chat/AgentSelectorToggle'; // Assuming this is used

const ChatPage = () => {
  return (
    <div className="flex flex-col h-full bg-background"> {/* Chat page fills its container */}
      <div className="flex-grow overflow-y-auto p-4">
        {/* Main chat display area */}
        <ChatWindow />
      </div>
      <div className="p-4 border-t border-border bg-card">
        {/* Chat input area */}
        <ChatInput />
        {/* AgentSelectorToggle could also be here if you want it below input */}
        {/* <AgentSelectorToggle /> */}
      </div>
    </div>
  );
};

export default ChatPage;