import React, { useState } from 'react';
import { Search, User, Calendar, FileText, LogIn, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Visitor } from '@/types/visitor';
import { formatCPF } from '@/utils/cpf-validator';

interface VisitorListProps {
  visitors: Visitor[];
  onVisitorSelect?: (visitor: Visitor) => void;
  onStatusChange?: (id: string, status: 'inside' | 'outside') => void;
}

export const VisitorList: React.FC<VisitorListProps> = ({ visitors, onVisitorSelect, onStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = visitors.filter(visitor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.name.toLowerCase().includes(searchLower) ||
      visitor.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
    );
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusConfig = (status: 'inside' | 'outside') => {
    return status === 'inside' 
      ? { 
          text: 'No estabelecimento',
          variant: 'default' as const,
          bgColor: 'bg-green-500/20 text-green-400 border-green-500/50',
          icon: LogIn
        }
      : { 
          text: 'Fora do estabelecimento',
          variant: 'secondary' as const,
          bgColor: 'bg-red-500/20 text-red-400 border-red-500/50',
          icon: LogOut
        };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-smooth"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredVisitors.length === 0 ? (
          <Card className="bg-gradient-card">
            <CardContent className="py-8 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum visitante encontrado' : 'Nenhum visitante cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVisitors.map((visitor) => (
            <Card 
              key={visitor.id} 
              className="bg-gradient-card shadow-card hover:shadow-lg transition-smooth cursor-pointer"
              onClick={() => onVisitorSelect?.(visitor)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    {visitor.photo ? (
                      <AvatarImage src={visitor.photo} alt={visitor.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {visitor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{visitor.name}</h3>
                    <p className="text-muted-foreground">CPF: {formatCPF(visitor.cpf)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(visitor.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusConfig(visitor.status).bgColor}>
                      {React.createElement(getStatusConfig(visitor.status).icon, { className: "w-3 h-3 mr-1" })}
                      {getStatusConfig(visitor.status).text}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange?.(visitor.id, 'inside');
                        }}
                        disabled={visitor.status === 'inside'}
                        className="h-7 px-2 text-xs"
                      >
                        <LogIn className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange?.(visitor.id, 'outside');
                        }}
                        disabled={visitor.status === 'outside'}
                        className="h-7 px-2 text-xs"
                      >
                        <LogOut className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredVisitors.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {filteredVisitors.length} visitante{filteredVisitors.length > 1 ? 's' : ''} encontrado{filteredVisitors.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};