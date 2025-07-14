import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllProcesses, addProcess as tauriAddProcess, updateProcess as tauriUpdateProcess, deleteProcess as tauriDeleteProcess } from '@/lib/tauri';

export interface Process {
  id: string;
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  pending_actions: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
  // Add camelCase aliases for compatibility
  dueDate?: string;
  pendingActions?: string[];
}

export const useProcesses = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcesses = async () => {
    try {
      const data = await getAllProcesses();
      
      const processedData = data.map(process => ({
        ...process,
        pending_actions: Array.isArray(process.pending_actions) ? process.pending_actions : [],
        // Add camelCase aliases for compatibility
        dueDate: process.due_date,
        pendingActions: Array.isArray(process.pending_actions) 
          ? process.pending_actions.filter((item: any) => typeof item === 'string') 
          : []
      } as Process));
      
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
    try {
      const data = await tauriAddProcess({
        ...processData,
        pending_actions: processData.pending_actions || processData.pendingActions || []
      });
      
      const processedData = {
        ...data,
        pending_actions: Array.isArray(data.pending_actions) ? data.pending_actions : [],
        dueDate: data.due_date,
        pendingActions: Array.isArray(data.pending_actions) 
          ? data.pending_actions.filter((item: any) => typeof item === 'string') 
          : []
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
      // Convert camelCase to snake_case for database
      const dbUpdates: any = { ...updates };
      if (updates.dueDate) {
        dbUpdates.due_date = updates.dueDate;
        delete dbUpdates.dueDate;
      }
      if (updates.pendingActions) {
        dbUpdates.pending_actions = updates.pendingActions;
        delete dbUpdates.pendingActions;
      }

      const data = await tauriUpdateProcess(id, dbUpdates);
      
      const processedData = {
        ...data,
        pending_actions: Array.isArray(data.pending_actions) ? data.pending_actions : [],
        dueDate: data.due_date,
        pendingActions: Array.isArray(data.pending_actions) 
          ? data.pending_actions.filter((item: any) => typeof item === 'string') 
          : []
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
      await tauriDeleteProcess(id);
      
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
  }, []);

  return {
    processes,
    loading,
    addProcess,
    updateProcess,
    deleteProcess,
    refreshProcesses: fetchProcesses
  };
};