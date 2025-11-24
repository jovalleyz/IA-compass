import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
}

export const useChat = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadConversations();
    subscribeToConversations();
  }, [userId]);

  useEffect(() => {
    if (!currentConversationId) return;
    loadMessages();
    subscribeToMessages();
  }, [currentConversationId]);

  const loadConversations = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async () => {
    if (!currentConversationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      toast.error('Error al cargar mensajes');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = () => {
    if (!currentConversationId) return;

    const channel = supabase
      .channel(`messages-${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${currentConversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startConversation = async (otherUserId: string) => {
    if (!userId) return null;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),` +
        `and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`
      )
      .single();

    if (existing) {
      setCurrentConversationId(existing.id);
      return existing.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: otherUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al iniciar conversación');
      return null;
    }

    setCurrentConversationId(data.id);
    await loadConversations();
    return data.id;
  };

  const sendMessage = async (content: string, file?: { url: string; name: string; type: string }) => {
    if (!currentConversationId || !userId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        sender_id: userId,
        content: content || null,
        file_url: file?.url || null,
        file_name: file?.name || null,
        file_type: file?.type || null,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    if (!userId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Error al subir archivo');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return {
      url: fileName,
      name: file.name,
      type: file.type,
    };
  };

  return {
    conversations,
    messages,
    currentConversationId,
    loading,
    setCurrentConversationId,
    startConversation,
    sendMessage,
    uploadFile,
  };
};
