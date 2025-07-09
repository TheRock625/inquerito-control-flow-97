import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCompletedActions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('completed_actions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Group by process_id
      const grouped = (data || []).reduce((acc, action) => {
        if (!acc[action.process_id]) {
          acc[action.process_id] = [];
        }
        acc[action.process_id].push(action.action_text);
        return acc;
      }, {} as {[processId: string]: string[]});
      
      setCompletedActions(grouped);
    } catch (error) {
      console.error('Error fetching completed actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionCompletion = async (processId: string, actionText: string) => {
    if (!user) return;

    const isCompleted = completedActions[processId]?.includes(actionText);
    
    try {
      if (isCompleted) {
        // Remove completed action
        const { error } = await supabase
          .from('completed_actions')
          .delete()
          .eq('process_id', processId)
          .eq('action_text', actionText)
          .eq('user_id', user.id);

        if (error) throw error;

        setCompletedActions(prev => ({
          ...prev,
          [processId]: prev[processId]?.filter(action => action !== actionText) || []
        }));
      } else {
        // Add completed action
        const { error } = await supabase
          .from('completed_actions')
          .insert([{
            process_id: processId,
            action_text: actionText,
            user_id: user.id
          }]);

        if (error) throw error;

        setCompletedActions(prev => ({
          ...prev,
          [processId]: [...(prev[processId] || []), actionText]
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
  }, [user]);

  return {
    completedActions,
    loading,
    toggleActionCompletion,
    refreshCompletedActions: fetchCompletedActions
  };
};