import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Edit2, Trash2, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  initiative_id: string;
  user_id: string;
  parent_id: string | null;
  contenido: string;
  mentioned_users: string[];
  edited_at: string | null;
  created_at: string;
  profile?: {
    nombre: string;
    foto_perfil_url: string | null;
  };
  replies?: Comment[];
}

interface Profile {
  id: string;
  nombre: string;
  foto_perfil_url: string | null;
}

interface InitiativeCommentsProps {
  initiativeId: string;
}

export const InitiativeComments: React.FC<InitiativeCommentsProps> = ({ initiativeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Profile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    loadComments();
    loadCollaborators();

    // Suscribirse a comentarios en tiempo real
    const channel = supabase
      .channel('initiative-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'initiative_comments',
          filter: `initiative_id=eq.${initiativeId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initiativeId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('initiative_comments')
      .select('*')
      .eq('initiative_id', initiativeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    if (!data) {
      setComments([]);
      return;
    }

    // Cargar perfiles de los usuarios
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nombre, foto_perfil_url')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Organizar comentarios en árbol (comentarios y respuestas)
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    data.forEach((comment) => {
      const profile = profileMap.get(comment.user_id);
      commentMap.set(comment.id, { 
        ...comment, 
        replies: [],
        mentioned_users: comment.mentioned_users || [],
        profile: profile ? {
          nombre: profile.nombre,
          foto_perfil_url: profile.foto_perfil_url
        } : undefined
      });
    });

    data.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    setComments(rootComments);
  };

  const loadCollaborators = async () => {
    // Cargar todos los colaboradores de la iniciativa
    const { data: collabData } = await supabase
      .from('initiative_collaborators')
      .select('user_id')
      .eq('initiative_id', initiativeId)
      .eq('estado', 'aceptado');

    // Cargar el dueño de la iniciativa
    const { data: initiativeData } = await supabase
      .from('initiatives')
      .select('user_id')
      .eq('id', initiativeId)
      .single();

    const userIds: string[] = [];
    
    if (initiativeData?.user_id) {
      userIds.push(initiativeData.user_id);
    }

    if (collabData) {
      userIds.push(...collabData.map(c => c.user_id));
    }

    // Cargar perfiles
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nombre, foto_perfil_url')
        .in('id', userIds);

      // Eliminar duplicados
      const uniqueProfiles = (profiles || []).filter(
        (profile, index, self) => index === self.findIndex((p) => p.id === profile.id)
      );

      setCollaborators(uniqueProfiles);
    }
  };

  const handleMentionInput = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtSign = textBeforeCursor.lastIndexOf('@');

    if (lastAtSign !== -1 && cursorPos > lastAtSign) {
      const searchTerm = textBeforeCursor.substring(lastAtSign + 1);
      setMentionSearch(searchTerm);
      setShowMentions(true);
      setCursorPosition(cursorPos);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (profile: Profile) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = replyingTo ? editContent : newComment;
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    const lastAtSign = beforeCursor.lastIndexOf('@');
    
    const newText = 
      beforeCursor.substring(0, lastAtSign) +
      `@${profile.nombre} ` +
      afterCursor;

    if (replyingTo) {
      setEditContent(newText);
    } else {
      setNewComment(newText);
    }

    setShowMentions(false);
    textarea.focus();
  };

  const extractMentionedUsers = (text: string): string[] => {
    const mentionedUserIds: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      const user = collaborators.find((c) => c.nombre.includes(mentionedName));
      if (user && !mentionedUserIds.includes(user.id)) {
        mentionedUserIds.push(user.id);
      }
    }

    return mentionedUserIds;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    const mentionedUsers = extractMentionedUsers(newComment);

    const { error } = await supabase.from('initiative_comments').insert({
      initiative_id: initiativeId,
      user_id: user.id,
      parent_id: replyingTo,
      contenido: newComment.trim(),
      mentioned_users: mentionedUsers,
    });

    if (error) {
      toast.error('Error al publicar comentario');
      console.error(error);
      return;
    }

    // No crear notificación aquí ya que no existe el tipo en el enum
    // Las notificaciones se manejarán en una actualización futura

    setNewComment('');
    setReplyingTo(null);
    toast.success('Comentario publicado');
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const mentionedUsers = extractMentionedUsers(editContent);

    const { error } = await supabase
      .from('initiative_comments')
      .update({
        contenido: editContent.trim(),
        mentioned_users: mentionedUsers,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) {
      toast.error('Error al editar comentario');
      return;
    }

    setEditingCommentId(null);
    setEditContent('');
    toast.success('Comentario editado');
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('initiative_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Error al eliminar comentario');
      return;
    }

    toast.success('Comentario eliminado');
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isOwner = user?.id === comment.user_id;

    return (
      <div key={comment.id} className={level > 0 ? 'ml-12 mt-4' : 'mt-4'}>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={comment.profile?.foto_perfil_url || undefined} />
              <AvatarFallback>
                {comment.profile?.nombre?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{comment.profile?.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                    {comment.edited_at && ' (editado)'}
                  </p>
                </div>

                {isOwner && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.contenido);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{comment.contenido}</p>
                  {level === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-2"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Responder
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {comment.replies?.map((reply) => renderComment(reply, level + 1))}
      </div>
    );
  };

  const filteredCollaborators = collaborators.filter((c) =>
    c.nombre.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comentarios</h3>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={
            replyingTo
              ? 'Escribe una respuesta... (usa @ para mencionar)'
              : 'Escribe un comentario... (usa @ para mencionar)'
          }
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            handleMentionInput(e.target.value, e.target.selectionStart);
          }}
          onKeyUp={(e) => {
            handleMentionInput(newComment, e.currentTarget.selectionStart);
          }}
          className="min-h-[100px]"
        />

        {showMentions && filteredCollaborators.length > 0 && (
          <Card className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto">
            {filteredCollaborators.map((profile) => (
              <button
                key={profile.id}
                onClick={() => insertMention(profile)}
                className="w-full p-3 hover:bg-accent text-left flex items-center gap-2"
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={profile.foto_perfil_url || undefined} />
                  <AvatarFallback>{profile.nombre.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{profile.nombre}</span>
              </button>
            ))}
          </Card>
        )}

        <div className="flex gap-2 mt-2">
          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {replyingTo ? 'Responder' : 'Comentar'}
          </Button>

          {replyingTo && (
            <Button variant="outline" onClick={() => setReplyingTo(null)}>
              Cancelar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const pos = textarea.selectionStart;
                const newText =
                  newComment.substring(0, pos) + '@' + newComment.substring(pos);
                setNewComment(newText);
                setCursorPosition(pos + 1);
                setShowMentions(true);
                textarea.focus();
              }
            }}
          >
            <AtSign className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};
