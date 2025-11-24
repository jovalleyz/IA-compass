import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send, CheckCircle, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SupportConversation {
  id: string;
  user_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  assigned_admin_id: string | null;
  status: string;
  subject: string | null;
  created_at: string;
}

interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  is_ai: boolean;
  content: string;
  created_at: string;
}

export const AdminSupportPanel = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
      subscribeToMessages(selectedConv);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);

    // Load user profiles for authenticated conversations
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id).filter(id => id !== null))] as string[];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nombre, email')
          .in('id', userIds);

        if (profiles) {
          const profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
          setUserProfiles(profilesMap);
        }
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('support-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations',
        },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`support-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTakeConversation = async (convId: string) => {
    const conversation = conversations.find(c => c.id === convId);

    if (conversation?.assigned_admin_id && conversation.assigned_admin_id !== user?.id) {
      toast.error('Esta conversación ya fue asignada a otro admin');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('support_conversations')
      .update({
        assigned_admin_id: user?.id,
        assigned_at: new Date().toISOString(),
        status: 'assigned',
      })
      .eq('id', convId)
      .is('assigned_admin_id', null);

    if (error) {
      console.error('Error taking conversation:', error);
      toast.error('No se pudo tomar la conversación. Puede que otro admin la haya tomado.');
    } else {
      toast.success('Conversación asignada');
      await loadConversations();
      setSelectedConv(convId);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConv || !user) return;

    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: selectedConv,
        sender_id: user.id,
        is_ai: false,
        content: input,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      return;
    }

    setInput('');
  };

  const handleResolve = async (convId: string) => {
    const { error } = await supabase
      .from('support_conversations')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', convId);

    if (error) {
      console.error('Error resolving conversation:', error);
      toast.error('Error al resolver conversación');
      return;
    }

    toast.success('Conversación marcada como resuelta');
    await loadConversations();
    setSelectedConv(null);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConv);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Solicitudes de Soporte</CardTitle>
          <CardDescription>
            {conversations.filter(c => c.status === 'pending').length} pendientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {conversations.map((conv) => {
                const profile = conv.user_id ? userProfiles[conv.user_id] : null;
                const isPending = conv.status === 'pending';
                const isAssignedToMe = conv.assigned_admin_id === user?.id;
                const isLead = !conv.user_id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      if (isPending) {
                        handleTakeConversation(conv.id);
                      } else if (isAssignedToMe) {
                        setSelectedConv(conv.id);
                      }
                    }}
                    disabled={conv.assigned_admin_id && !isAssignedToMe && !loading}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedConv === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : isPending
                        ? 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:border-yellow-800'
                        : isAssignedToMe
                          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800'
                          : 'bg-muted/50 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {isLead ? conv.contact_name : (profile?.nombre || 'Usuario')}
                          </p>
                          {isLead && (
                            <Badge variant="secondary" className="text-xs">Lead</Badge>
                          )}
                        </div>
                        {isLead && conv.contact_email && (
                          <p className="text-xs opacity-70 mt-0.5">{conv.contact_email}</p>
                        )}
                        <p className="text-xs opacity-80 mt-1">
                          {conv.subject || 'Sin asunto'}
                        </p>
                      </div>
                      <Badge variant={isPending ? 'default' : isAssignedToMe ? 'secondary' : 'outline'}>
                        {isPending ? 'Nuevo' : isAssignedToMe ? 'Asignado' : 'Tomado'}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-60 mt-2">
                      {formatDistanceToNow(new Date(conv.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {userProfiles[selectedConversation.user_id]?.nombre || 'Usuario'}
                  </CardTitle>
                  <CardDescription>
                    {selectedConversation.subject}
                  </CardDescription>
                </div>
                {selectedConversation.status !== 'resolved' && (
                  <Button
                    onClick={() => handleResolve(selectedConversation.id)}
                    size="sm"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como resuelta
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    const isAI = msg.is_ai;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={isAI ? 'bg-purple-500' : isMe ? 'bg-primary' : 'bg-secondary'}>
                            {isAI ? 'AI' : <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] ${isMe
                            ? 'bg-primary text-primary-foreground'
                            : isAI
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-100'
                              : 'bg-muted'
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu respuesta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Selecciona una conversación para comenzar
          </div>
        )}
      </Card>
    </div>
  );
};
