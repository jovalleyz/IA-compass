import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MessageContent } from './MessageContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  nombre: string;
}

export const AlanChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHumanSupport, setShowHumanSupport] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminAssigned, setAdminAssigned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Show welcome popup after 10 seconds for non-authenticated users
  useEffect(() => {
    if (!user && !isOpen) {
      const showTimer = setTimeout(() => {
        setShowWelcomePopup(true);
        
        // Hide after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowWelcomePopup(false);
        }, 5000);

        return () => clearTimeout(hideTimer);
      }, 10000);

      return () => clearTimeout(showTimer);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile && user && messages.length === 0) {
      // Only set personalized message for authenticated users
      setMessages([
        {
          role: 'assistant',
          content: `¡Hola ${userProfile.nombre}! Soy Alan, tu asistente de OVM Consulting. ¿En qué puedo ayudarte hoy?`
        }
      ]);
    } else if (!user && isOpen && messages.length === 0) {
      // Generic message for non-authenticated users (no session saving)
      setMessages([
        {
          role: 'assistant',
          content: '¡Hola! Soy Alan, tu asistente de OVM Consulting. ¿En qué puedo ayudarte hoy?'
        }
      ]);
    }
  }, [userProfile, user, isOpen, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alan-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userName: userProfile?.nombre,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Límite de uso alcanzado. Por favor intenta más tarde.');
          setMessages(prev => prev.filter(m => m !== userMessage));
          return;
        }
        if (response.status === 402) {
          toast.error('Fondos insuficientes. Contacta al administrador.');
          setMessages(prev => prev.filter(m => m !== userMessage));
          return;
        }
        setMessages(prev => prev.filter(m => m !== userMessage));
        throw new Error('Error al obtener respuesta');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No se pudo iniciar el stream');

      let assistantMessage = '';
      let textBuffer = '';

      // Add empty assistant message that will be updated
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantMessage += content;
              
              // Update the last message
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage
                };
                return newMessages;
              });

              // Check if Alan suggests connecting with a human
              if (assistantMessage.toLowerCase().includes('conecte con') || 
                  assistantMessage.toLowerCase().includes('equipo de ovm') ||
                  assistantMessage.toLowerCase().includes('experto')) {
                setShowHumanSupport(true);
              }
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Error al comunicarse con Alan');
      
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHumanSupport = async () => {
    if (!user) {
      // Show contact form for non-authenticated users
      setShowContactForm(true);
      setShowHumanSupport(false);
      return;
    }

    try {
      // Create support conversation for authenticated users
      const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          subject: 'Solicitud de soporte desde Alan',
          status: 'pending',
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add initial message with chat history
      const chatHistory = messages.map(m => `${m.role === 'user' ? 'Usuario' : 'Alan'}: ${m.content}`).join('\n\n');
      
      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          is_ai: false,
          content: `Historial de conversación con Alan:\n\n${chatHistory}\n\n---\n\nEl usuario solicita ayuda humana.`,
        });

      if (msgError) throw msgError;

      toast.success('¡Solicitud enviada! Un experto de OVM Consulting te contactará pronto.');
      setShowHumanSupport(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error requesting human support:', error);
      toast.error('Error al solicitar soporte. Intenta de nuevo.');
    }
  };

  const handleSubmitContactForm = async () => {
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    try {
      // Create support conversation for non-authenticated users
      const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: null,
          contact_name: contactName,
          contact_email: contactEmail,
          subject: `Solicitud de soporte - ${contactName}`,
          status: 'pending',
        })
        .select()
        .single();

      if (convError) throw convError;

      // Create lead record
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          contact_name: contactName,
          contact_email: contactEmail,
          phone: contactPhone || null,
          conversation_id: conversation.id,
          registered: false,
        });

      if (leadError) throw leadError;

      setConversationId(conversation.id);

      // Add initial message with chat history
      const chatHistory = messages.map(m => `${m.role === 'user' ? contactName : 'Alan'}: ${m.content}`).join('\n\n');
      
      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: null,
          is_ai: false,
          content: `Contacto: ${contactName} (${contactEmail})\n\nHistorial de conversación con Alan:\n\n${chatHistory}\n\n---\n\nEl usuario solicita ayuda humana.`,
        });

      if (msgError) throw msgError;

      // Subscribe to new messages from admin (realtime)
      const messagesChannel = supabase
        .channel(`support-messages-${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `conversation_id=eq.${conversation.id}`,
          },
          async (payload) => {
            const newMessage = payload.new as any;
            console.log('New message received:', newMessage);
            
            // Only show messages from admin (sender_id exists and is not AI)
            if (newMessage.sender_id && !newMessage.is_ai) {
              console.log('Admin message detected, adding to chat');
              setMessages(prev => {
                // Avoid duplicates
                const exists = prev.some(m => 
                  m.role === 'assistant' && 
                  m.content === newMessage.content
                );
                if (exists) return prev;
                
                return [...prev, {
                  role: 'assistant',
                  content: newMessage.content
                }];
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('Messages channel subscription status:', status);
        });

      // Subscribe to conversation updates to detect when admin is assigned
      const convChannel = supabase
        .channel(`conversation-${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'support_conversations',
            filter: `id=eq.${conversation.id}`,
          },
          (payload) => {
            const updatedConversation = payload.new as any;
            if (updatedConversation.assigned_admin_id && !adminAssigned) {
              setAdminAssigned(true);
              toast.success('¡Un experto de OVM Consulting ha tomado tu chat!');
            }
          }
        )
        .subscribe();

      // Add confirmation message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `¡Gracias ${contactName}! Tu solicitud ha sido enviada. Un experto de OVM Consulting te contactará pronto por email a ${contactEmail}. Te notificaremos aquí cuando alguien tome tu chat.`
      }]);

      toast.success('¡Solicitud enviada exitosamente!');
      setShowContactForm(false);
      setShowHumanSupport(false);
    } catch (error) {
      console.error('Error requesting human support:', error);
      toast.error('Error al solicitar soporte. Intenta de nuevo.');
    }
  };

  if (!isOpen) {
    return (
      <>
        <Button
          onClick={() => {
            setIsOpen(true);
            setShowWelcomePopup(false);
          }}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-40"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
        
        {/* Welcome popup message */}
        {showWelcomePopup && (
          <div 
            className="fixed bottom-40 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-40 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary rounded-full p-2 shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">¡Hola! Soy Alan</p>
                <p className="text-xs text-muted-foreground">
                  ¿Tienes dudas sobre diagnóstico de IA? Estoy aquí para ayudarte.
                </p>
              </div>
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Card className="fixed bottom-24 right-6 w-96 h-[600px] shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Alan</h3>
            <p className="text-xs opacity-90">Asistente Virtual OVM</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={msg.role === 'user' ? 'bg-primary' : 'bg-secondary'}>
                  {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[80%]',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <MessageContent content={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Contact Form for Non-Authenticated Users */}
      {showContactForm && (
        <div className="p-4 border-t bg-muted/50 space-y-3">
          <p className="text-sm font-medium">Ingresa tus datos para contactar con OVM</p>
          <Input
            placeholder="Tu nombre"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Tu email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            type="tel"
            placeholder="Tu teléfono (opcional)"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitContactForm}
              className="flex-1"
              size="sm"
            >
              Enviar
            </Button>
            <Button
              onClick={() => {
                setShowContactForm(false);
                setContactName('');
                setContactEmail('');
                setContactPhone('');
              }}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Human Support Button */}
      {showHumanSupport && !showContactForm && (
        <div className="p-3 border-t bg-muted/50">
          <Button
            onClick={handleRequestHumanSupport}
            variant="outline"
            className="w-full text-sm"
            size="sm"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Conectar con experto de OVM
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
