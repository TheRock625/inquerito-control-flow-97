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
  // Se não está vencido, cor padrão
  return 'text-text-primary font-medium';
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
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 cursor-pointer" onClick={onClick}>
      <div className="space-y-4">
        {/* Header com círculo verde e número/ano do processo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-success-indicator rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{process.number}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-header-bg">
                {process.processNumber || `IP ${process.number}/25 - 24ª DP`}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">IP</span>
            </div>
            <div className="text-sm font-medium text-text-primary mt-1">
              Inquérito Policial
            </div>
          </div>
        </div>

        {/* Descrição do processo */}
        <div className="text-sm text-text-primary font-medium">
          {process.summary || process.type || 'ESTELIONATO.'}
        </div>

        {/* Vencimento */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <span className="text-text-secondary">Vencimento:</span>
          <span className={getDueDateColor(process.dueDate)}>
            {format(parseISO(process.dueDate), "dd/MM/yyyy", { locale: ptBR })}
          </span>
          {isOverdue && (
            <AlertTriangle className="w-4 h-4 text-destructive ml-1" />
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-text-secondary"></div>
          <span className="text-text-secondary">Status:</span>
          <span className="font-medium text-text-primary">{process.status}</span>
        </div>

        {/* Providências */}
        {pendingActions.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <ListTodo className="w-4 h-4 text-orange-500" />
            <span className="text-text-secondary">Providências:</span>
            <span className="text-orange-600 font-medium">
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-button-primary hover:bg-button-primary-hover text-white border-none transition-colors duration-200 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Detalhes
          </Button>
          {process.forwarding && (
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              {process.forwarding}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProcessCard;