
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useConfig } from '@/contexts/ConfigContext';
import { X } from 'lucide-react';

interface NewProcessModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (process: any) => void;
}

const NewProcessModal = ({ open, onClose, onSave }: NewProcessModalProps) => {
  const { origins, statuses, forwardings } = useConfig();
  const [formData, setFormData] = useState({
    number: '',
    year: '',
    origin: '',
    type: '',
    status: '',
    dueDate: '',
    forwarding: '',
    summary: '',
    pendingActions: [] as string[]
  });
  const [newPendingAction, setNewPendingAction] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatProcessNumber = (number: string, year: string, type: string, origin: string) => {
    // Remove any existing formatting
    const cleanNumber = number.replace(/[^\d]/g, '');
    const cleanYear = year.replace(/[^\d]/g, '').slice(-2); // Get last 2 digits
    
    return `${type} ${cleanNumber}/${cleanYear} - ${origin}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.year || !formData.origin || !formData.type || !formData.status || !formData.dueDate || !formData.forwarding) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Format the process number with the correct pattern
    const formattedNumber = formatProcessNumber(formData.number, formData.year, formData.type, formData.origin);

    const newProcess = {
      number: formattedNumber,
      type: formData.type,
      status: formData.status,
      due_date: formData.dueDate,
      forwarding: formData.forwarding,
      summary: formData.summary,
      pending_actions: formData.pendingActions
    };

    onSave(newProcess);
    setFormData({
      number: '',
      year: '',
      origin: '',
      type: '',
      status: '',
      dueDate: '',
      forwarding: '',
      summary: '',
      pendingActions: []
    });
    setNewPendingAction('');
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      number: '',
      year: '',
      origin: '',
      type: '',
      status: '',
      dueDate: '',
      forwarding: '',
      summary: '',
      pendingActions: []
    });
    setNewPendingAction('');
    onClose();
  };

  const handleAddPendingAction = () => {
    if (newPendingAction.trim()) {
      setFormData(prev => ({
        ...prev,
        pendingActions: [...prev.pendingActions, newPendingAction.trim()]
      }));
      setNewPendingAction('');
      // Focus back to input after adding
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPendingAction();
    }
  };

  const removePendingAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Processo</DialogTitle>
          <DialogDescription>
            Adicione um novo inquérito, termo circunstanciado ou PAAI
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                placeholder="Ex: 210"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="year">Ano *</Label>
              <Input
                id="year"
                placeholder="Ex: 2025"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="origin">Origem *</Label>
              <Select value={formData.origin} onValueChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  {origins.map((origin) => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IP">IP</SelectItem>
                  <SelectItem value="TC">TC</SelectItem>
                  <SelectItem value="PAAI">PAAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="forwarding">Encaminhamento *</Label>
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
          </div>

          <div>
            <Label htmlFor="summary">Resumo</Label>
            <Textarea
              id="summary"
              placeholder="Breve descrição do processo..."
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="pendingActions">Providências Pendentes</Label>
            <div className="space-y-2">
              {formData.pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border">
                  <span className="text-sm">{action}</span>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    onClick={() => removePendingAction(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Digite uma providência e pressione Enter"
                  value={newPendingAction}
                  onChange={(e) => setNewPendingAction(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={handleAddPendingAction}>Adicionar</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Processo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProcessModal;
