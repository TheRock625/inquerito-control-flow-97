import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Check, Calendar } from 'lucide-react';
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
}
const ProcessCard = ({
  process,
  onClick
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
  const completedActionsFromStorage = (window as any).sharedCompletedActions || {};
  const completedForProcess = completedActionsFromStorage[process.id] || [];
  const pendingCount = process.pendingActions.length - completedForProcess.length;

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
        {process.summary && <p className="text-sm text-gray-600 leading-relaxed">
            {process.summary}
          </p>}

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
            <span className="font-medium">{process.status}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Detalhes
          </Button>
          <Badge className={getForwardingColor(process.forwarding)} variant="secondary">
            {process.forwarding}
          </Badge>
        </div>
      </div>
    </div>;
};
export default ProcessCard;