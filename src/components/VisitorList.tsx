import React, { useState, useMemo } from 'react';
import { Search, User, Calendar, FileText, LogIn, LogOut, Clock, MessageSquare, Trash2, X, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Visitor } from '@/types/visitor';
import { formatCPF } from '@/utils/cpf-validator';
import { formatDateBR, formatTimeBR, formatDateOnlyBR } from '@/utils/date-formatter';

interface VisitorListProps {
  visitors: Visitor[];
  onVisitorSelect?: (visitor: Visitor) => void;
  onStatusChange?: (id: string, status: 'inside' | 'outside') => void;
  onDeleteVisitor?: (id: string) => void;
  getVisitorHistory?: (documentNumber: string) => Visitor[];
  isLoading?: boolean;
}

export const VisitorList: React.FC<VisitorListProps> = ({ 
  visitors, 
  onVisitorSelect, 
  onStatusChange, 
  onDeleteVisitor, 
  getVisitorHistory,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/\D/g, '');

    return visitors.filter(visitor => {
      // Buscar por nome
      if (visitor.name.toLowerCase().includes(searchLower)) return true;

      // Buscar por CPF (apenas números)
      if (visitor.cpf && visitor.cpf.replace(/\D/g, '').includes(searchNumbers)) return true;

      // Buscar por número do documento
      if (visitor.document_number && visitor.document_number.toLowerCase().includes(searchLower)) return true;

      // Buscar por motivo da visita
      if (visitor.visit_reason && visitor.visit_reason.toLowerCase().includes(searchLower)) return true;

      // Buscar por status
      if (visitor.status && visitor.status.toLowerCase().includes(searchLower)) return true;

      // Buscar por data de visita
      if (visitor.visit_date && visitor.visit_date.includes(searchLower)) return true;

      // Buscar por tipo de documento
      if (visitor.document_type && visitor.document_type.toLowerCase().includes(searchLower)) return true;

      // Buscar por horário de entrada/saída
      if (visitor.entry_time && visitor.entry_time.includes(searchLower)) return true;
      if (visitor.exit_time && visitor.exit_time.includes(searchLower)) return true;

      return false;
    });
  }, [visitors, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVisitors = filteredVisitors.slice(startIndex, endIndex);

  // Reset página quando busca muda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Usar as funções de formatação com fuso horário de Brasília
  const formatDate = formatDateBR;
  const formatTime = formatTimeBR;
  const formatDateOnly = formatDateOnlyBR;

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

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700">Carregando visitantes...</h3>
          <p className="text-sm text-gray-500">Aguarde enquanto buscamos os dados</p>
        </div>
      </div>
    );
  }

  // Estado vazio
  if (visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Users className="w-16 h-16 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700">Nenhum visitante encontrado</h3>
          <p className="text-sm text-gray-500">Comece cadastrando o primeiro visitante</p>
        </div>
      </div>
    );
  }

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
              placeholder="Buscar por nome, documento, CPF, motivo, status, data, horário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de visitantes */}
      <div className="grid gap-4">
        {paginatedVisitors.map((visitor) => {
          const statusConfig = getStatusConfig(visitor.status);
          const StatusIcon = statusConfig.icon;
          const visitCount = getVisitorHistory ? getVisitorHistory(visitor.document_number).length : 1;

          return (
            <Card key={visitor.id} className="bg-gradient-card shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onVisitorSelect?.(visitor)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={visitor.photo} alt={visitor.name} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {visitor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{visitor.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {visitCount} visita{visitCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{visitor.document_type}: {visitor.document_number}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Última visita: {formatDateOnly(visitor.visit_date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {visitor.entry_time ? formatTime(visitor.entry_time) : '--:--'} - {visitor.exit_time ? formatTime(visitor.exit_time) : '--:--'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="truncate">{visitor.visit_reason}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge className={`${statusConfig.bgColor} border`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.text}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange?.(visitor.id, visitor.status === 'inside' ? 'outside' : 'inside');
                        }}
                        className="text-xs"
                      >
                        {visitor.status === 'inside' ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
                      </Button>
                      
                      {onDeleteVisitor && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o visitante "{visitor.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteVisitor(visitor.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVisitors.length)} de {filteredVisitors.length} visitantes
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};