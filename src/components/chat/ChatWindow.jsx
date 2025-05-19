// src/components/chat/ChatWindow.jsx
import React, { useEffect, useRef } from 'react';
import useChatStore from '../../store/chatStore';
import ChatMessage from './ChatMessage';
import { ScrollArea } from "@/components/ui/scroll-area"; // shadcn/ui
import LoadingSpinner from '../common/LoadingSpinner'; // Create this

const ChatWindow = () => {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const scrollAreaRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow h-[300px] w-full rounded-md border p-4 mb-4" ref={scrollAreaRef}> {/* Adjust h-[300px] */}
      <div ref={viewportRef} className="h-full">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <LoadingSpinner /> 
            <span className="ml-2 text-sm text-muted-foreground">AetherPro is thinking...</span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
export default ChatWindow;