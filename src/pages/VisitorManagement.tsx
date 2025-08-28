import React, { useState } from 'react';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorList } from '@/components/VisitorList';
import { useVisitors } from '@/hooks/useVisitors';
import { CreateVisitorData, Visitor } from '@/types/visitor';

type ViewMode = 'list' | 'add' | 'view';

export const VisitorManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const { visitors, addVisitor, updateVisitorStatus, isLoading } = useVisitors();

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

  const renderHeader = () => {
    const headerConfig = {
      list: {
        title: 'Controle de Acesso - Portaria',
        subtitle: `${visitors.length} visitante${visitors.length !== 1 ? 's' : ''} cadastrado${visitors.length !== 1 ? 's' : ''}`,
        action: (
          <Button onClick={() => setCurrentView('add')} className="shadow-button">
            <Plus className="w-4 h-4 mr-2" />
            Novo Visitante
          </Button>
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
          <div className="max-w-md mx-auto">
            {/* Implementar detalhes do visitante aqui */}
            <p>Detalhes de {selectedVisitor.name}</p>
          </div>
        ) : null;
      case 'list':
      default:
        return (
          <VisitorList
            visitors={visitors}
            onVisitorSelect={handleVisitorSelect}
            onStatusChange={updateVisitorStatus}
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