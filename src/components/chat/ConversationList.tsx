import React, { useEffect, useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  onConversationSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  onConversationSelect,
  onNewChat,
}) => {
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    loadProfiles();
  }, [conversations]);

  const loadProfiles = async () => {
    const userIds = conversations.map((conv) =>
      conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id
    );

    if (userIds.length === 0) return;

    const { data } = await supabase
      .from('profiles')
      .select('id, nombre, foto_perfil_url')
      .in('id', userIds);

    if (data) {
      const profilesMap = data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
      setProfiles(profilesMap);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nueva conversación
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tienes conversaciones aún
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => {
              const otherUserId =
                conv.participant1_id === currentUserId
                  ? conv.participant2_id
                  : conv.participant1_id;
              const profile = profiles[otherUserId];

              return (
                <button
                  key={conv.id}
                  onClick={() => onConversationSelect(conv.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={profile?.foto_perfil_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{profile?.nombre || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
