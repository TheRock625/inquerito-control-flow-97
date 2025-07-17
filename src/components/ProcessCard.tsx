
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Calendar, ListTodo } from 'lucide-react';
import { format, parseISO, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para determinar a cor da bolinha e da data baseada no vencimento
const getStatusInfo = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);

  // Verificar se o vencimento é no final de semana da semana corrente
  const isCurrentWeekend = () => {
    const dayOfWeek = getDay(due);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    const diffInDays = Math.abs(daysDiff);
    return isWeekend && diffInDays <= 7;
  };
  if (daysDiff < 0) {
    // Vencido
    return {
      circleColor: 'bg-red-500',
      dateColor: 'text-red-500',
      status: 'overdue'
    };
  } else if (daysDiff <= 2 || isCurrentWeekend()) {
    // Próximo do vencimento (2 dias ou final de semana da semana corrente)
    return {
      circleColor: 'bg-yellow-500',
      dateColor: 'text-yellow-600',
      status: 'warning'
    };
  } else {
    // Em dia
    return {
      circleColor: 'bg-green-500',
      dateColor: 'text-green-600',
      status: 'normal'
    };
  }
};

// Função para obter cores de encaminhamento
const getForwardingColor = (forwarding: string) => {
  const colors = ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800', 'bg-teal-100 text-teal-800', 'bg-pink-100 text-pink-800'];
  const index = forwarding.length % colors.length;
  return colors[index];
};

// Função para formatar o número do processo
const formatProcessNumber = (process: any) => {
  const processType = process.type || 'IP'; // IP, TC, PAAI
  const processNumber = process.number || process.processNumber || '1';
  const processYear = process.year || '25'; // ano em 2 dígitos
  const origin = process.origin || '15º DF';

  // Formatar número com pelo menos 2 dígitos
  const formattedNumber = processNumber.toString().padStart(2, '0');
  return `${processType} ${formattedNumber}/${processYear} - ${origin}`;
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
  const statusInfo = getStatusInfo(process.dueDate);

  // Contar pendências não completadas
  const pendingActions = process.pending_actions || process.pendingActions || [];
  const pendingCount = pendingActions.length - completedActions.length;
  
  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200" onClick={onClick} style={{
        margin: '10px',
        padding: '8px'
      }}>
        <div className="space-y-3">
          {/* Cabeçalho com bolinha colorida e número do processo */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusInfo.circleColor}`}></div>
            <span className="text-blue-dark font-arial text-base font-medium">
              {formatProcessNumber(process)}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 ml-auto">IP</span>
          </div>

          {/* Descrição do processo */}
          <div className="text-black text-sm font-arial">
            {process.summary || process.type || 'ESTELIONATO.'}
          </div>

          {/* Vencimento */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="font-bold text-gray-800">Vencimento:</span>
            <span className={`${statusInfo.dateColor} font-medium`}>
              {format(parseISO(process.dueDate), "dd/MM/yyyy", {
                locale: ptBR
              })}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-gray-500">Status:</span>
            <span className="font-bold text-gray-700">{process.status}</span>
          </div>

          {/* Providências */}
          {pendingActions.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <ListTodo className="w-3 h-3 text-orange-500" />
              <span className="text-gray-500">Providências:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-orange-600 font-medium cursor-help">
                    {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-1">Pendências:</p>
                    <ul className="text-sm space-y-1">
                      {pendingActions
                        .filter((action: string) => !completedActions.includes(action))
                        .map((action: string, index: number) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Encaminhamento (se houver) */}
          {process.forwarding && (
            <div className="text-xs">
              <span className={`px-2 py-1 rounded text-xs ${getForwardingColor(process.forwarding)}`}>
                {process.forwarding}
              </span>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="default" size="sm" className="bg-blue-primary hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition-colors duration-200" onClick={e => {
              e.stopPropagation();
              onClick();
            }}>
              Detalhes
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProcessCard;
