
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
    case 'Aguardando Oitiva': return 'bg-blue-100 text-blue-800';
    case 'Em Diligência': return 'bg-purple-100 text-purple-800';
    case 'Pronto para Relatar': return 'bg-sky-100 text-sky-800';
    case 'Aguardando Perícia': return 'bg-orange-100 text-orange-800';
    case 'RELATADO':
    case 'Relatado': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface ProcessCardProps {
  process: any;
  onClick: () => void;
}

const ProcessCard = ({ process, onClick }: ProcessCardProps) => {
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

  return (
    <div
      className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md bg-slate-50 border-slate-200 hover:bg-slate-100"
      onClick={onClick}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-lg text-blue-700 hover:text-blue-900 underline">
              {process.number}
            </span>
            <Badge variant="outline" className="bg-white">
              {process.type}
            </Badge>
            <Badge className={getStatusColor(process.status)}>
              {process.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                Vencimento: 
              </span>
              <div className="flex items-center gap-1">
                {showAlert && (
                  <div className="relative group">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    {isWeekendDate && (
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
                <span className={getDueDateColor(process.dueDate)}>
                  {format(parseISO(process.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Encaminhamento: </span>
              <Badge className={getForwardingColor(process.forwarding)}>
                {process.forwarding}
              </Badge>
            </div>
          </div>
          
          <div className="mt-2">
            <span className="font-medium text-sm text-gray-700">Pendências: </span>
            <span className="text-sm text-gray-600">
              {pendingCount > 0 ? 
                `${pendingCount} ${pendingCount === 1 ? 'ação pendente' : 'ações pendentes'}` : 
                'Nenhuma pendência'
              }
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {process.status.toUpperCase() === 'RELATADO' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <>
              {alertLevel === 'critical' && (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              {alertLevel === 'warning' && (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </>
          )}
          <Button variant="outline" size="sm">
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard;
