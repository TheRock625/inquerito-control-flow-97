import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Process {
  id: string;
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  pending_actions: string[] | any;
  summary?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useProcesses = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProcesses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedData = (data || []).map(process => ({
        ...process,
        pending_actions: Array.isArray(process.pending_actions) ? process.pending_actions : []
      }));
      
      setProcesses(processedData);
    } catch (error) {
      console.error('Error fetching processes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar processos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProcess = async (processData: Omit<Process, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('processes')
        .insert([{
          ...processData,
          user_id: user.id,
          pending_actions: processData.pending_actions || []
        }])
        .select()
        .single();

      if (error) throw error;
      
      const processedData = {
        ...data,
        pending_actions: Array.isArray(data.pending_actions) ? data.pending_actions : []
      };
      
      setProcesses(prev => [processedData, ...prev]);
      toast({
        title: "Sucesso",
        description: "Processo adicionado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding process:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar processo",
        variant: "destructive",
      });
    }
  };

  const updateProcess = async (id: string, updates: Partial<Process>) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const processedData = {
        ...data,
        pending_actions: Array.isArray(data.pending_actions) ? data.pending_actions : []
      };
      
      setProcesses(prev => prev.map(p => p.id === id ? processedData : p));
      toast({
        title: "Sucesso",
        description: "Processo atualizado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating process:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar processo",
        variant: "destructive",
      });
    }
  };

  const deleteProcess = async (id: string) => {
    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProcesses(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Processo excluído com sucesso",
      });
    } catch (error) {
      console.error('Error deleting process:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir processo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [user]);

  return {
    processes,
    loading,
    addProcess,
    updateProcess,
    deleteProcess,
    refreshProcesses: fetchProcesses
  };
};