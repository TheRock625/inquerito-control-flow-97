
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useConfig } from '@/contexts/ConfigContext';
import { format } from 'date-fns';

interface Process {
  id: string;
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  summary?: string;
  pending_actions: string[];
}

interface EditProcessModalProps {
  open: boolean;
  onClose: () => void;
  process: Process | null;
  onSave: (updatedProcess: Process) => void;
}

const EditProcessModal = ({ open, onClose, process, onSave }: EditProcessModalProps) => {
  const { statuses, forwardings } = useConfig();
  const [formData, setFormData] = useState<Partial<Process>>({});
  const [newPendingAction, setNewPendingAction] = useState('');

  // Initialize form data when process changes
  useEffect(() => {
    if (process) {
      setFormData({
        status: process.status,
        due_date: process.due_date,
        forwarding: process.forwarding,
        summary: process.summary || '',
        pending_actions: [...process.pending_actions]
      });
    }
  }, [process]);

  const handleSave = () => {
    if (!process) return;
    
    const updatedProcess = {
      ...process,
      ...formData,
      pending_actions: formData.pending_actions || process.pending_actions
    };
    
    onSave(updatedProcess);
    onClose();
  };

  const addPendingAction = () => {
    if (newPendingAction.trim()) {
      setFormData(prev => ({
        ...prev,
        pending_actions: [...(prev.pending_actions || []), newPendingAction.trim()]
      }));
      setNewPendingAction('');
    }
  };

  const removePendingAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pending_actions: prev.pending_actions?.filter((_, i) => i !== index) || []
    }));
  };

  if (!process) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alterar Detalhes do Processo</DialogTitle>
          <DialogDescription>
            Processo {process.number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="forwarding">Encaminhamento</Label>
            <Select value={formData.forwarding} onValueChange={(value) => setFormData(prev => ({ ...prev, forwarding: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o encaminhamento" />
              </SelectTrigger>
              <SelectContent>
                {forwardings.map((forwarding) => (
                  <SelectItem key={forwarding} value={forwarding}>{forwarding}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="summary">Resumo</Label>
            <Textarea
              id="summary"
              placeholder="Breve descrição do processo..."
              value={formData.summary || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label>Providências Pendentes</Label>
            <div className="space-y-2">
              {formData.pending_actions?.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border">
                  <span className="text-sm">{action}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => removePendingAction(index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Nova providência..."
                  value={newPendingAction}
                  onChange={(e) => setNewPendingAction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPendingAction()}
                />
                <Button onClick={addPendingAction}>Adicionar</Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProcessModal;
