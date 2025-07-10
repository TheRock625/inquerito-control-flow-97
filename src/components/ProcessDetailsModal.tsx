import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProcessInfoCard from '@/components/ProcessInfoCard';
import PendingActionsCard from '@/components/PendingActionsCard';
import ProcessHistoryCard from '@/components/ProcessHistoryCard';
import ProcessActionButtons from '@/components/ProcessActionButtons';

interface ProcessDetailsModalProps {
  process: any;
  open: boolean;
  onClose: () => void;
  completedActions: { [processId: string]: string[] };
  onCompleteAction: (processId: string, actionText: string) => void;
  onDeleteProcess: (processId: string) => void;
  onSaveProcess: (processId: string, editData: any) => void;
}

const ProcessDetailsModal = ({
  process,
  open,
  onClose,
  completedActions,
  onCompleteAction,
  onDeleteProcess,
  onSaveProcess
}: ProcessDetailsModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingData, setEditingData] = useState<any>({});
  const [newPendingAction, setNewPendingAction] = useState('');

  console.log('ProcessDetailsModal render - process:', process, 'open:', open);
  if (!process) return null;

  const handleStartEdit = () => {
    setIsEditMode(true);
    setEditingData({
      status: process.status,
      due_date: process.dueDate,
      forwarding: process.forwarding,
      pending_actions: [...(process.pendingActions || [])],
      summary: process.summary || ''
    });
    setNewPendingAction('');
  };

  const handleSaveEdit = () => {
    onSaveProcess(process.id, editingData);
    setIsEditMode(false);
    setEditingData({});
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingData({});
    setNewPendingAction('');
  };

  const handleAddPendingAction = () => {
    const newAction = newPendingAction.trim();
    if (!newAction) return;

    setEditingData(prev => ({
      ...prev,
      pending_actions: [...(prev.pending_actions || []), newAction]
    }));
    setNewPendingAction('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPendingAction();
    }
  };

  const handleRemovePendingAction = (actionIndex: number) => {
    setEditingData(prev => ({
      ...prev,
      pending_actions: prev.pending_actions?.filter((_, i) => i !== actionIndex) || []
    }));
  };

  const handleUpdateEditingData = (updates: any) => {
    setEditingData(prev => ({ ...prev, ...updates }));
  };

  const currentProcess = isEditMode ? { 
    ...process, 
    ...editingData,
    // Garantir compatibilidade entre snake_case e camelCase
    pendingActions: editingData.pending_actions || process.pendingActions || []
  } : process;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Processo {currentProcess.number}
            <Badge variant="outline">{currentProcess.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do processo
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProcessInfoCard 
                process={currentProcess}
                isEditMode={isEditMode}
                editingData={editingData}
                onUpdateEditingData={handleUpdateEditingData}
              />
              
              <PendingActionsCard 
                process={currentProcess}
                isEditMode={isEditMode}
                completedActions={completedActions[currentProcess.id] || []}
                newPendingAction={newPendingAction}
                onNewPendingActionChange={setNewPendingAction}
                onAddPendingAction={handleAddPendingAction}
                onRemovePendingAction={handleRemovePendingAction}
                onCompleteAction={onCompleteAction}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <ProcessActionButtons 
              process={currentProcess}
              isEditMode={isEditMode}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDeleteProcess={onDeleteProcess}
            />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <ProcessHistoryCard 
              processId={currentProcess.id}
              completedActions={completedActions[currentProcess.id] || []}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessDetailsModal;