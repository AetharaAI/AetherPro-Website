// src/components/chat/ChatMessage.jsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // shadcn/ui
import { Card, CardContent } from "@/components/ui/card"; // shadcn/ui
import ReactMarkdown from 'react-markdown'; // For rendering markdown responses
// npm install react-markdown

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAetherPro = message.sender === 'aetherpro';
  const isSystem = message.sender === 'system';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
        {!isUser && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={isSystem ? "/system-icon.png" : "/aetherpro-logo.png"} alt={message.sender} /> {/* Add your logos */}
            <AvatarFallback>{isSystem ? 'SYS' : 'AP'}</AvatarFallback>
          </Avatar>
        )}
        <Card className={`p-3 rounded-lg ${
            isUser ? 'bg-primary text-primary-foreground' 
                   : isAetherPro ? (message.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-muted') 
                                 : 'bg-accent text-accent-foreground italic'
        }`}>
          <CardContent className="p-0 text-sm">
            {/* Use ReactMarkdown if responses can contain markdown */}
            {isAetherPro && message.type !== 'error' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
            {isAetherPro && message.sources && message.sources.length > 0 && message.type === 'merged' && (
              <p className="text-xs mt-2 text-muted-foreground opacity-75">
                Sources: {message.sources.join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatMessage;