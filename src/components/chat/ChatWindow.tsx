import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  onSendMessage: (content: string, file?: { url: string; name: string; type: string }) => void;
  onUploadFile: (file: File) => Promise<{ url: string; name: string; type: string } | null>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserId,
  loading,
  onSendMessage,
  onUploadFile,
}) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo PDF, DOC, JPG, PNG');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 10MB');
      return;
    }

    setUploading(true);
    const fileData = await onUploadFile(file);
    if (fileData) {
      onSendMessage('', fileData);
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setUploading(true);
          const fileData = await onUploadFile(file);
          if (fileData) {
            onSendMessage('', fileData);
          }
          setUploading(false);
        }
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setUploading(true);
    const fileData = await onUploadFile(file);
    if (fileData) {
      onSendMessage('', fileData);
    }
    setUploading(false);
  };

  const renderFilePreview = (message: Message) => {
    if (!message.file_url) return null;

    const isImage = message.file_type?.startsWith('image/');
    
    return (
      <div className="mt-2">
        {isImage ? (
          <img
            src={message.file_url}
            alt={message.file_name || 'Imagen'}
            className="max-w-xs rounded-lg"
          />
        ) : (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{message.file_name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1 p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay mensajes aún. ¡Envía el primero!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {isOwn ? 'Tú' : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('flex flex-col gap-1', isOwn && 'items-end')}>
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 max-w-[250px]',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      {renderFilePreview(msg)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            onPaste={handlePaste}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
