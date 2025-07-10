
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getForwardingColor } from '@/utils/forwardingColors';
import { useConfig } from '@/contexts/ConfigContext';
import { AlertTriangle } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Aguardando Oitiva': return 'bg-blue-100 text-blue-800';
    case 'Em Diligência': return 'bg-purple-100 text-purple-800';
    case 'Pronto para Relatar': return 'bg-sky-100 text-sky-800';
    case 'Aguardando Perícia': return 'bg-orange-100 text-orange-800';
    case 'RELATADO':
    case 'Relatado': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDueDateColor = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);
  
  if (daysDiff < 0) return 'text-red-600 font-bold';
  if (daysDiff <= 2) return 'text-yellow-600 font-bold';
  return 'text-green-600 font-bold';
};

const isWeekend = (dueDate: string) => {
  const due = parseISO(dueDate);
  const dayOfWeek = getDay(due);
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const shouldShowAlert = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);
  return daysDiff <= 2 || isWeekend(dueDate);
};

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
  const { statuses, forwardings } = useConfig();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingData, setEditingData] = useState<any>({});
  const [newPendingAction, setNewPendingAction] = useState('');

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

  const handleRemovePendingAction = (actionIndex: number) => {
    setEditingData(prev => ({
      ...prev,
      pending_actions: prev.pending_actions?.filter((_, i) => i !== actionIndex) || []
    }));
  };

  const currentProcess = isEditMode ? { ...process, ...editingData } : process;

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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Número:</span>
                    <p className="text-lg font-bold text-blue-700">{currentProcess.number}</p>
                  </div>
                  <div>
                    <span className="font-medium">Resumo:</span>
                    {isEditMode ? (
                      <textarea
                        value={editingData.summary || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev, summary: e.target.value }))}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder="Digite um resumo para o processo..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {currentProcess.summary || 'Nenhum resumo cadastrado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    {isEditMode ? (
                      <Select 
                        value={editingData.status} 
                        onValueChange={(value) => setEditingData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(statuses || []).map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(currentProcess.status)}>
                        {currentProcess.status}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Vencimento:</span>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={editingData.due_date}
                        onChange={(e) => setEditingData(prev => ({ ...prev, due_date: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {shouldShowAlert(currentProcess.dueDate) && (
                          <div className="relative group">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            {isWeekend(currentProcess.dueDate) && (
                              <div className="absolute bottom-6 left-0 hidden group-hover:block">
                                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 shadow-lg whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs text-yellow-800">Final de Semana</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <p className={cn("text-lg font-bold", getDueDateColor(currentProcess.dueDate))}>
                          {format(parseISO(currentProcess.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Encaminhamento:</span>
                    {isEditMode ? (
                      <Select 
                        value={editingData.forwarding} 
                        onValueChange={(value) => setEditingData(prev => ({ ...prev, forwarding: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(forwardings || []).map((forwarding) => (
                            <SelectItem key={forwarding} value={forwarding}>{forwarding}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getForwardingColor(currentProcess.forwarding)}>
                        {currentProcess.forwarding}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Providências Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {(currentProcess.pendingActions || []).length > 0 ? (
                    <div className="space-y-2">
                      {(currentProcess.pendingActions || []).map((action, index) => {
                        const isCompleted = completedActions[currentProcess.id]?.includes(action);
                        return (
                          <div key={index} className={cn(
                            "flex items-center justify-between p-2 rounded border-l-4",
                            isCompleted 
                              ? "bg-gray-100 text-gray-500 border-gray-400" 
                              : "bg-orange-50 border-orange-400"
                          )}>
                            <span className={cn("text-sm", isCompleted && "line-through")}>
                              {action}
                            </span>
                            <div className="flex gap-1">
                              {isEditMode && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRemovePendingAction(index)}
                                >
                                  Remover
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onCompleteAction(currentProcess.id, action)}
                              >
                                {isCompleted ? 'Reativar' : 'Dar Baixa'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {isEditMode && (
                        <div className="flex gap-2 mt-3">
                           <Input
                            placeholder="Nova providência..."
                            value={newPendingAction}
                            onChange={(e) => setNewPendingAction(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddPendingAction()}
                          />
                          <Button onClick={handleAddPendingAction}>Adicionar</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-center text-gray-500 py-4">
                        Nenhuma providência pendente
                      </p>
                      {isEditMode && (
                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Nova providência..."
                            value={newPendingAction}
                            onChange={(e) => setNewPendingAction(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddPendingAction()}
                          />
                          <Button onClick={handleAddPendingAction}>Adicionar</Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Excluir Processo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O processo {currentProcess.number} será permanentemente removido do sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteProcess(currentProcess.id)}>
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSaveEdit}
                    >
                      Salvar
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleStartEdit}
                  >
                    Alterar Detalhes
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Providências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(currentProcess.completedActions || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(item.date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessDetailsModal;
