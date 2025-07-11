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
  return <div onClick={onClick} className="p-6 border cursor-pointer transition-all hover:shadow-xl bg-white border-gray-200 hover:border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] min-h-[280px] w-full">
      <div className="space-y-3">
        {/* Header com número e indicador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {getStatusIndicator()} {process.number}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {process.type}
          </Badge>
        </div>

        {/* Resumo do processo */}
        {process.summary && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {process.summary}
          </p>
        )}

        {/* Informações principais */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Vencimento:</span>
            <span className={getDueDateColor(process.dueDate)}>
              {format(parseISO(process.dueDate), "dd/MM/yyyy", {
              locale: ptBR
            })}
            </span>
            {showAlert && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${process.status.toUpperCase() === 'RELATADO' ? 'text-green-800 bg-green-100 px-2 py-1 rounded' : ''}`}>{process.status}</span>
          </div>

          {/* Providências Pendentes */}
          {pendingActions.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <ListTodo className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">Providências:</span>
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Providências Pendentes</h4>
                  <div className="space-y-1">
                    {pendingActions.map((action: string, index: number) => {
                      const isCompleted = completedActions.includes(action);
                      return (
                        <div key={index} className={`flex items-center gap-2 text-xs p-1 rounded ${
                          isCompleted ? 'text-green-600 bg-green-50' : 'text-gray-700'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-orange-500" />
                          )}
                          <span className={isCompleted ? 'line-through' : ''}>{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Detalhes
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Badge className={getForwardingColor(process.forwarding)} variant="secondary">
            {process.forwarding}
          </Badge>
        </div>
      </div>
    </div>;
};
export default ProcessCard;