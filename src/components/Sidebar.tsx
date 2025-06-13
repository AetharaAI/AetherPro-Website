import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  X, 
  Menu,
  Search,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react';

// Types (you already have these, but including for the demo)
interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  lastUpdated: string;
  agent?: string;
  turns: any[];
  userId?: string;
}

interface SlidingSidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  currentConversationId: string;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SlidingSidebar: React.FC<SlidingSidebarProps> = ({
  conversations,
  onNewChat,
  onSelectConversation,
  currentConversationId,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onToggle
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  // Prevent body scroll when sidebar is open on mobile
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
    } else if (diffInHours < 168) { // 7 days
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
                  // Close sidebar on mobile after selection
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
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
        {/* Header */}
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
            
            {/* Close button for mobile */}
            <button
              onClick={onToggle}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              // Close sidebar on mobile after creating new chat
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search */}
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

        {/* Conversations List */}
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

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </aside>
    </>
  );
};

// Toggle Button Component (for when sidebar is closed)
export const SidebarToggle: React.FC<{ onClick: () => void; isOpen: boolean }> = ({ 
  onClick, 
  isOpen 
}) => {
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
      {isOpen ? (
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
};

export default SlidingSidebar;

// Updated ConsolePage integration example:
/*
In your ConsolePage.tsx, replace the existing Sidebar with this:

1. Import the new components:
import SlidingSidebar, { SidebarToggle } from '../components/SlidingSidebar';

2. Add sidebar state:
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

3. Replace the existing Sidebar component in your JSX with:
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

4. Add the toggle button in your main content area:
<SidebarToggle 
  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
  isOpen={isSidebarOpen} 
/>

5. Update your main content wrapper to handle the sidebar state:
<div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'md:ml-0'}`}>
  // Your existing chat content
</div>
*/