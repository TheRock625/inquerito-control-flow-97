import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { getForwardingColor } from '@/utils/forwardingColors';
import { getStatusColor, getDueDateColor, shouldShowAlert, isWeekend, formatDueDate } from '@/utils/processUtils';

interface ProcessInfoCardProps {
  process: any;
  isEditMode: boolean;
  editingData: any;
  onUpdateEditingData: (updates: any) => void;
}

const ProcessInfoCard = ({ process, isEditMode, editingData, onUpdateEditingData }: ProcessInfoCardProps) => {
  const { statuses, forwardings } = useConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="font-medium">Número:</span>
          <p className="text-lg font-bold text-blue-700">{process.number}</p>
        </div>
        <div>
          <span className="font-medium">Resumo:</span>
          {isEditMode ? (
            <textarea
              value={editingData.summary || ''}
              onChange={(e) => onUpdateEditingData({ summary: e.target.value })}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Digite um resumo para o processo..."
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {process.summary || 'Nenhum resumo cadastrado'}
            </p>
          )}
        </div>
        <div>
          <span className="font-medium">Status:</span>
          {isEditMode ? (
            <Select 
              value={editingData.status} 
              onValueChange={(value) => onUpdateEditingData({ status: value })}
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
            <Badge className={getStatusColor(process.status)}>
              {process.status}
            </Badge>
          )}
        </div>
        <div>
          <span className="font-medium">Vencimento:</span>
          {isEditMode ? (
            <Input
              type="date"
              value={editingData.due_date}
              onChange={(e) => onUpdateEditingData({ due_date: e.target.value })}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              {shouldShowAlert(process.dueDate) && (
                <div className="relative group">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  {isWeekend(process.dueDate) && (
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
              <p className={cn("text-lg font-bold", getDueDateColor(process.dueDate))}>
                {formatDueDate(process.dueDate)}
              </p>
            </div>
          )}
        </div>
        <div>
          <span className="font-medium">Encaminhamento:</span>
          {isEditMode ? (
            <Select 
              value={editingData.forwarding} 
              onValueChange={(value) => onUpdateEditingData({ forwarding: value })}
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
            <Badge className={getForwardingColor(process.forwarding)}>
              {process.forwarding}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessInfoCard;