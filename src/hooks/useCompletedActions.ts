import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCompletedActions, toggleActionCompletion as tauriToggleActionCompletion } from '@/lib/tauri';

interface CompletedAction {
  id: string;
  process_id: string;
  action_text: string;
  completed_at: string;
  user_id: string;
}

export const useCompletedActions = () => {
  const [completedActions, setCompletedActions] = useState<{[processId: string]: string[]}>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompletedActions = async () => {
    try {
      const grouped = await getCompletedActions();
      setCompletedActions(grouped);
    } catch (error) {
      console.error('Error fetching completed actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionCompletion = async (processId: string, actionText: string) => {
    const isCompleted = completedActions[processId]?.includes(actionText);
    
    try {
      const newState = await tauriToggleActionCompletion(processId, actionText);

      if (newState) {
        // Action is now completed
        setCompletedActions(prev => ({
          ...prev,
          [processId]: [...(prev[processId] || []), actionText]
        }));
      } else {
        // Action is now not completed
        setCompletedActions(prev => ({
          ...prev,
          [processId]: prev[processId]?.filter(action => action !== actionText) || []
        }));
      }
    } catch (error) {
      console.error('Error toggling action completion:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ação",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCompletedActions();
  }, []);

  return {
    completedActions,
    loading,
    toggleActionCompletion,
    refreshCompletedActions: fetchCompletedActions
  };
};