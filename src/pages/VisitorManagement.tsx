import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorList } from '@/components/VisitorList';
import { VisitorDetails } from '@/components/VisitorDetails';
import { useVisitors } from '@/hooks/useVisitors';
import { useAuth } from '@/hooks/useAuth';
import { CreateVisitorData, Visitor } from '@/types/visitor';

type ViewMode = 'list' | 'add' | 'view';

export const VisitorManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { visitors, addVisitor, updateVisitorStatus, deleteVisitor, getUniqueVisitors, getVisitorHistory, isLoading } = useVisitors();

  // Monitorar quando não há visitantes e garantir que estamos na tela inicial
  useEffect(() => {
    const uniqueVisitors = getUniqueVisitors();

    // Só redirecionar se não há visitantes E estamos visualizando um visitante específico
    if (uniqueVisitors.length === 0 && currentView === 'view') {
      setCurrentView('list');
      setSelectedVisitor(null);
    }
  }, [visitors]); // Removido currentView das dependências para evitar loops

  const handleAddVisitor = async (data: CreateVisitorData) => {
    try {
      await addVisitor(data);
      setCurrentView('list');
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
    }
  };

  const handleVisitorSelect = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setCurrentView('view');
  };

  const handleDeleteVisitor = async (id: string) => {
    try {
      await deleteVisitor(id);
      // Se estivermos visualizando o visitante que foi deletado, voltar para a lista
      if (selectedVisitor && selectedVisitor.id === id) {
        setCurrentView('list');
        setSelectedVisitor(null);
      }
    } catch (error) {
      console.error('Erro ao deletar visitante:', error);
    }
  };

  const handleStatusChange = async (id: string, status: 'inside' | 'outside') => {
    try {
      await updateVisitorStatus(id, status);
      // Atualizar o selectedVisitor se for o mesmo que está sendo visualizado
      if (selectedVisitor && selectedVisitor.id === id) {
        setSelectedVisitor(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 500));
      logout();
      // Forçar reload da página para garantir que vá para o login
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  const renderHeader = () => {
    const headerConfig = {
      list: {
        title: 'Controle de Acesso - Portaria',
        subtitle: `Bem-vindo, ${user?.username} | ${getUniqueVisitors().length} visitante${getUniqueVisitors().length !== 1 ? 's' : ''} únicos | ${visitors.length} visita${visitors.length !== 1 ? 's' : ''} registrada${visitors.length !== 1 ? 's' : ''}`,
        action: (
          <div className="flex gap-2">
            <Button onClick={() => setCurrentView('add')} className="shadow-button">
              <Plus className="w-4 h-4 mr-2" />
              Novo Visitante
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-white border-white/20 hover:bg-white/10"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        )
      },
      add: {
        title: 'Cadastrar Visitante',
        subtitle: 'Preencha os dados para cadastrar um novo visitante',
        action: (
          <Button variant="outline" onClick={() => setCurrentView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )
      },
      view: {
        title: selectedVisitor?.name || 'Detalhes do Visitante',
        subtitle: 'Informações do visitante',
        action: (
          <Button variant="outline" onClick={() => setCurrentView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )
      }
    };

    const config = headerConfig[currentView];

    return (
      <div className="bg-gradient-primary text-white p-6 rounded-lg mb-8 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">{config.title}</h1>
              <p className="text-white/80">{config.subtitle}</p>
            </div>
          </div>
          {config.action}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return (
          <VisitorForm
            onSubmit={handleAddVisitor}
            onCancel={() => setCurrentView('list')}
          />
        );
      case 'view':
        return selectedVisitor ? (
          <VisitorDetails
            visitor={selectedVisitor}
            visitorHistory={getVisitorHistory(selectedVisitor.document_number)}
            onStatusChange={handleStatusChange}
            onDeleteVisitor={handleDeleteVisitor}
            onBack={() => setCurrentView('list')}
          />
        ) : null;
      case 'list':
      default:
        return (
          <VisitorList
            visitors={getUniqueVisitors()}
            onVisitorSelect={handleVisitorSelect}
            onStatusChange={handleStatusChange}
            onDeleteVisitor={handleDeleteVisitor}
            getVisitorHistory={getVisitorHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
};