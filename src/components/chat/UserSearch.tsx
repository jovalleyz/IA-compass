import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserSearch } from '@/hooks/useUserSearch';
import { Skeleton } from '@/components/ui/skeleton';

interface UserSearchProps {
  onUserSelect: (userId: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading } = useUserSearch(searchTerm);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, empresa, cargo, país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm.length < 2 
                ? 'Escribe al menos 2 caracteres para buscar'
                : 'No se encontraron usuarios'}
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarImage src={user.foto_perfil_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{user.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {[user.cargo, user.empresa, user.pais].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
