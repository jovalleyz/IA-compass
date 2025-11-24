import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserSearch } from './UserSearch';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'search' | 'chat'>('list');
  const { user } = useAuth();
  const chat = useChat(user?.id || null);

  if (!user) return null;

  const handleUserSelect = async (userId: string) => {
    await chat.startConversation(userId);
    setView('chat');
  };

  const handleConversationSelect = (conversationId: string) => {
    chat.setCurrentConversationId(conversationId);
    setView('chat');
  };

  const handleBack = () => {
    if (view === 'chat') {
      chat.setCurrentConversationId(null);
      setView('list');
    } else if (view === 'search') {
      setView('list');
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">
              {view === 'list' && 'Mensajes'}
              {view === 'search' && 'Buscar usuarios'}
              {view === 'chat' && 'Chat'}
            </h3>
            <div className="flex gap-2">
              {view !== 'list' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                >
                  ←
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {view === 'list' && (
              <ConversationList
                conversations={chat.conversations}
                currentUserId={user.id}
                onConversationSelect={handleConversationSelect}
                onNewChat={() => setView('search')}
              />
            )}
            {view === 'search' && (
              <UserSearch onUserSelect={handleUserSelect} />
            )}
            {view === 'chat' && chat.currentConversationId && (
              <ChatWindow
                messages={chat.messages}
                currentUserId={user.id}
                loading={chat.loading}
                onSendMessage={chat.sendMessage}
                onUploadFile={chat.uploadFile}
              />
            )}
          </div>
        </Card>
      )}
    </>
  );
};
