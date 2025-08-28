import { useState, useCallback, useEffect } from 'react';
import { Visitor, CreateVisitorData } from '@/types/visitor';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitors((data as Visitor[]) || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar visitantes",
        description: "Não foi possível carregar a lista de visitantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = useCallback(async (data: CreateVisitorData) => {
    setIsLoading(true);
    try {
      const { data: newVisitor, error } = await supabase
        .from('visitors')
        .insert({
          name: data.name,
          cpf: data.cpf,
          photo: data.photo,
          status: data.status || 'inside'
        })
        .select()
        .single();

      if (error) throw error;

      setVisitors(prev => [newVisitor as Visitor, ...prev]);
      
      toast({
        title: "Visitante cadastrado!",
        description: `${data.name} foi cadastrado com sucesso.`
      });

      return newVisitor;
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o visitante. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVisitorStatus = useCallback(async (id: string, status: 'inside' | 'outside') => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setVisitors(prev => prev.map(visitor => 
        visitor.id === id ? { ...visitor, status } : visitor
      ));

      const statusText = status === 'inside' ? 'entrou no' : 'saiu do';
      toast({
        title: "Status atualizado!",
        description: `Visitante ${statusText} estabelecimento.`
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do visitante.",
        variant: "destructive"
      });
    }
  }, []);

  const searchVisitors = useCallback((term: string) => {
    if (!term) return visitors;
    
    const searchLower = term.toLowerCase();
    return visitors.filter(visitor => 
      visitor.name.toLowerCase().includes(searchLower) ||
      visitor.cpf.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
    );
  }, [visitors]);

  return {
    visitors,
    addVisitor,
    updateVisitorStatus,
    searchVisitors,
    isLoading,
    fetchVisitors
  };
};