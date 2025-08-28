import React, { useState, useMemo } from 'react';
import { Search, User, Calendar, FileText, LogIn, LogOut, Clock, MessageSquare, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export const VisitorList: React.FC<VisitorListProps> = ({ visitors, onVisitorSelect, onStatusChange, onDeleteVisitor, getVisitorHistory }) => {
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
              placeholder="Buscar por nome, documento, CPF ou motivo da visita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 transition-smooth"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {paginatedVisitors.length === 0 ? (
          <Card className="bg-gradient-card">
            <CardContent className="py-8 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum visitante encontrado' : 'Nenhum visitante cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedVisitors.map((visitor) => (
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
                    <p className="text-muted-foreground">
                      {visitor.document_type}: {visitor.document_number}
                    </p>
                    {getVisitorHistory && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {getVisitorHistory(visitor.document_number).length} visita{getVisitorHistory(visitor.document_number).length !== 1 ? 's' : ''} registrada{getVisitorHistory(visitor.document_number).length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {visitor.visit_reason && (
                      <div className="flex items-start gap-2 mt-1">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {visitor.visit_reason}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDateOnly(visitor.visit_date)}</span>
                      </div>
                      {visitor.entry_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Entrada: {formatTime(visitor.entry_time)}</span>
                        </div>
                      )}
                      {visitor.exit_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Saída: {formatTime(visitor.exit_time)}</span>
                        </div>
                      )}
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
                      {onDeleteVisitor && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Visitante</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover este visitante? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteVisitor(visitor.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
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
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card className="bg-gradient-card">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} • {filteredVisitors.length} visitante{filteredVisitors.length !== 1 ? 's' : ''} encontrado{filteredVisitors.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {visitors.length > 0 && totalPages <= 1 && (
        <div className="text-center text-sm text-muted-foreground">
          {searchTerm ? (
            <>
              {filteredVisitors.length} de {visitors.length} visitante{visitors.length > 1 ? 's' : ''} encontrado{filteredVisitors.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              {visitors.length} visitante{visitors.length > 1 ? 's' : ''} cadastrado{visitors.length > 1 ? 's' : ''}
            </>
          )}
        </div>
      )}
    </div>
  );
};