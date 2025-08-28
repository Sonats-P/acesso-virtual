import { useState, useCallback } from 'react';
import { Visitor, CreateVisitorData } from '@/types/visitor';
import { toast } from '@/hooks/use-toast';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addVisitor = useCallback(async (data: CreateVisitorData) => {
    setIsLoading(true);
    try {
      // Simular API call - aqui você conectaria com Supabase
      const newVisitor: Visitor = {
        id: Date.now().toString(),
        name: data.name,
        cpf: data.cpf,
        photo: data.photo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setVisitors(prev => [newVisitor, ...prev]);
      
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
    searchVisitors,
    isLoading
  };
};