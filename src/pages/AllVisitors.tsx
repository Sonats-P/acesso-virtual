import React, { useState, useMemo } from 'react';
import { ArrowLeft, Users, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useVisitors } from '@/hooks/useVisitors';
import { useAuth } from '@/hooks/useAuth';
import { Visitor } from '@/types/visitor';
import { formatDateBR, formatTimeBR, formatDateOnlyBR } from '@/utils/date-formatter';

export const AllVisitors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { visitors, updateVisitorStatus, deleteVisitor, getVisitorHistory, isLoading } = useVisitors();

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

  const getStatusConfig = (status: 'inside' | 'outside') => {
    return status === 'inside'
      ? {
        text: 'No estabelecimento',
        variant: 'default' as const,
        bgColor: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: '🟢'
      }
      : {
        text: 'Fora do estabelecimento',
        variant: 'secondary' as const,
        bgColor: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: '🔴'
      };
  };

  const formatDate = formatDateBR;
  const formatTime = formatTimeBR;
  const formatDateOnly = formatDateOnlyBR;

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700">Carregando todos os visitantes...</h3>
              <p className="text-sm text-gray-500">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-primary text-white p-6 rounded-lg mb-8 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Todos os Visitantes</h1>
                <p className="text-white/80">
                  Bem-vindo, {user?.username} | {visitors.length} visita{visitors.length !== 1 ? 's' : ''} registrada{visitors.length !== 1 ? 's' : ''} | {filteredVisitors.length} resultado{filteredVisitors.length !== 1 ? 's' : ''} da busca
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="text-white border-white/20 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Busca */}
        <Card className="bg-gradient-card shadow-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, documento, CPF, motivo, status, data..."
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
            const visitCount = getVisitorHistory(visitor.document_number).length;

            return (
              <Card key={visitor.id} className="bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
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
                          <Badge className={`${statusConfig.bgColor} border`}>
                            {statusConfig.icon} {statusConfig.text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Documento:</span>
                            <span>{visitor.document_type}: {visitor.document_number}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Data:</span>
                            <span>{formatDateOnly(visitor.visit_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Horário:</span>
                            <span>
                              {visitor.entry_time ? formatTime(visitor.entry_time) : '--:--'} - {visitor.exit_time ? formatTime(visitor.exit_time) : '--:--'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 md:col-span-3">
                            <span className="font-medium">Motivo:</span>
                            <span className="truncate">{visitor.visit_reason}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="text-xs text-gray-500">
                        ID: {visitor.id.slice(0, 8)}...
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateVisitorStatus(visitor.id, visitor.status === 'inside' ? 'outside' : 'inside')}
                          className="text-xs"
                        >
                          {visitor.status === 'inside' ? 'Sair' : 'Entrar'}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                            >
                              Excluir
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
                                onClick={() => deleteVisitor(visitor.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
          <Card className="bg-gradient-card shadow-card mt-6">
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

        {/* Estado vazio */}
        {filteredVisitors.length === 0 && !isLoading && (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? 'Nenhum visitante encontrado' : 'Nenhum visitante registrado'}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece cadastrando o primeiro visitante'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
