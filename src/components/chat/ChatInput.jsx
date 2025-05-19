// src/components/chat/ChatInput.jsx
import React, { useState } from 'react';
import useChatStore from '../../store/chatStore';
import { Textarea } from "@/components/ui/textarea"; // shadcn/ui
import { Button } from "@/components/ui/button"; // shadcn/ui
import { PaperPlaneIcon } from '@radix-ui/react-icons'; // npm install @radix-ui/react-icons

const ChatInput = () => {
  const [inputText, setInputText] = useState('');
  const sendPromptToAetherPro = useChatStore((state) => state.sendPromptToAetherPro);
  const isLoading = useChatStore((state) => state.isLoading);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendPromptToAetherPro(inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Send a message to AetherPro..."
        className="flex-grow resize-none"
        rows={1}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !inputText.trim()}>
        <PaperPlaneIcon className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
};

export default ChatInput;