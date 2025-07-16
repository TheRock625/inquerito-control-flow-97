import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Check, Calendar, ListTodo, Edit } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getForwardingColor } from '@/utils/forwardingColors';
const getAlertLevel = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);
  if (daysDiff < 0) return 'critical';
  if (daysDiff <= 2) return 'warning';
  return 'normal';
};
const isWeekend = (dueDate: string) => {
  const due = parseISO(dueDate);
  const dayOfWeek = getDay(due);
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
};
const getDueDateColor = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);

  // Se está vencido (dias negativos), vermelho
  if (daysDiff < 0) {
    return 'text-red-600 font-bold';
  }
  // Se não está vencido, verde
  return 'text-green-600 font-bold';
};
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Aguardando Oitiva':
      return 'bg-blue-100 text-blue-800';
    case 'Em Diligência':
      return 'bg-purple-100 text-purple-800';
    case 'Pronto para Relatar':
      return 'bg-sky-100 text-sky-800';
    case 'Aguardando Perícia':
      return 'bg-orange-100 text-orange-800';
    case 'RELATADO':
    case 'Relatado':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
interface ProcessCardProps {
  process: any;
  onClick: () => void;
  completedActions?: string[];
  onEdit?: () => void;
}
const ProcessCard = ({
  process,
  onClick,
  completedActions = [],
  onEdit
}: ProcessCardProps) => {
  const alertLevel = getAlertLevel(process.dueDate);
  const isWeekendDate = isWeekend(process.dueDate);
  const showAlert = alertLevel === 'warning' || isWeekendDate;

  // Verificar se o processo está vencido para colorir também a palavra "Vencimento:"
  const today = new Date();
  const due = parseISO(process.dueDate);
  const daysDiff = differenceInDays(due, today);
  const isOverdue = daysDiff < 0;

  // Contar pendências não completadas
  const pendingActions = process.pending_actions || process.pendingActions || [];
  const pendingCount = pendingActions.length - completedActions.length;

  // Indicador de status baseado no vencimento
  const getStatusIndicator = () => {
    if (isOverdue) return '🔴'; // Vencido
    if (alertLevel === 'warning') return '🟡'; // Próximo do vencimento
    return '🟢'; // Normal
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer" onClick={onClick}>
      <div className="space-y-3">
        {/* Header com círculo IP e número do processo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">IP</span>
            </div>
            <span className="text-base font-semibold text-gray-900">
              {process.number}
            </span>
          </div>
          <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
            IP
          </Badge>
        </div>

        {/* Tipo de processo */}
        <div className="text-sm font-medium text-gray-700 uppercase">
          {process.summary || process.type}
        </div>

        {/* Vencimento */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Vencimento:</span>
          <span className={getDueDateColor(process.dueDate)}>
            {format(parseISO(process.dueDate), "dd/MM/yyyy", { locale: ptBR })}
          </span>
          {showAlert && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          <span className="text-gray-600">Status:</span>
          <span className="font-medium text-gray-800">{process.status}</span>
        </div>

        {/* Providências */}
        {pendingActions.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <ListTodo className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Providências:</span>
            <span className="text-orange-600 font-medium">
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Detalhes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            Escritório
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ProcessCard;