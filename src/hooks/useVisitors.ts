import { useState, useCallback, useEffect } from 'react';
import { Visitor, CreateVisitorData } from '@/types/visitor';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateBR } from '@/utils/date-formatter';

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
          cpf: data.cpf || null,
          document_type: data.document_type || 'CPF',
          document_number: data.document_number || data.cpf,
          photo: data.photo,
          visit_reason: data.visit_reason,
          status: data.status || 'inside',
          visit_date: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
        })
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      setVisitors(prev => [newVisitor as Visitor, ...prev]);

      toast({
        title: "Visitante cadastrado!",
        description: `${data.name} foi cadastrado com sucesso.`
      });

      return newVisitor;
    } catch (error) {
      console.error('Erro completo ao cadastrar:', error);
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
      // Atualizar também os timestamps de entrada/saída
      const updateData: any = { status };

      if (status === 'inside') {
        updateData.entry_time = new Date().toISOString();
        updateData.exit_time = null;
      } else {
        updateData.exit_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('visitors')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setVisitors(prev => prev.map(visitor =>
        visitor.id === id ? { ...visitor, ...updateData } : visitor
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

  const deleteVisitor = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVisitors(prev => prev.filter(visitor => visitor.id !== id));

      toast({
        title: "Visitante removido!",
        description: "Visitante foi removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o visitante. Tente novamente.",
        variant: "destructive"
      });
    }
  }, []);

  const searchVisitors = useCallback((term: string) => {
    if (!term) return visitors;

    const searchLower = term.toLowerCase();
    return visitors.filter(visitor =>
      visitor.name.toLowerCase().includes(searchLower) ||
      (visitor.cpf && visitor.cpf.replace(/\D/g, '').includes(term.replace(/\D/g, ''))) ||
      visitor.document_number?.toLowerCase().includes(searchLower) ||
      visitor.visit_reason?.toLowerCase().includes(searchLower)
    );
  }, [visitors]);

  const getVisitorHistory = useCallback((documentNumber: string) => {
    return visitors.filter(visitor =>
      visitor.document_number === documentNumber
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [visitors]);

  const getUniqueVisitors = useCallback(() => {
    const uniqueVisitors = new Map();

    visitors.forEach(visitor => {
      const key = visitor.document_number;
      if (!uniqueVisitors.has(key) || new Date(visitor.created_at) > new Date(uniqueVisitors.get(key).created_at)) {
        uniqueVisitors.set(key, visitor);
      }
    });

    return Array.from(uniqueVisitors.values()).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [visitors]);

  return {
    visitors,
    addVisitor,
    updateVisitorStatus,
    deleteVisitor,
    searchVisitors,
    getVisitorHistory,
    getUniqueVisitors,
    isLoading,
    fetchVisitors
  };
};