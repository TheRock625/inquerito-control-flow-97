import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ListTodo } from 'lucide-react';
import { format, parseISO, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para determinar a cor da bolinha e da data baseada no vencimento
const getStatusInfo = (dueDate: string) => {
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);

  const isCurrentWeekend = () => {
    const dayOfWeek = getDay(due);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    const diffInDays = Math.abs(daysDiff);
    return isWeekend && diffInDays <= 7;
  };
  
  if (daysDiff < 0) {
    return {
      circleColor: 'bg-red-500',
      dateColor: 'text-red-500',
      status: 'overdue'
    };
  } else if (daysDiff <= 2 || isCurrentWeekend()) {
    return {
      circleColor: 'bg-yellow-500',
      dateColor: 'text-yellow-600',
      status: 'warning'
    };
  } else {
    return {
      circleColor: 'bg-green-500',
      dateColor: 'text-green-600',
      status: 'normal'
    };
  }
};

// Função para obter cores de encaminhamento baseada no tipo
const getForwardingColor = (forwarding: string) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-green-100 text-green-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
    'bg-gray-100 text-gray-800'
  ];
  
  let hash = 0;
  for (let i = 0; i < forwarding.length; i++) {
    const char = forwarding.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Função para verificar e garantir que `forwarding` seja um array
const ensureArray = (value: any) => Array.isArray(value) ? value : [value];

// Função para formatar o número do processo
const formatProcessNumber = (process: any): string => {
  if (!process) return '--';
  
  const typeMap: Record<string, string> = {
    'Inquérito Policial': 'IP',
    'Termo Circunstanciado': 'TC',
    'Procedimento de Apuração de Ato Infracional': 'PAAI'
  };
  
  const rawType = process.type ?? '';
  const typeAbbreviation = typeMap[rawType] ?? '';
  
  const rawNumber = process.number ?? process.processNumber;
  const formattedNumber = rawNumber !== undefined ? rawNumber.toString().padStart(2, '0') : '';
  
  const rawYear = process.year;
  let formattedYear = '';
  if (rawYear !== undefined) {
    const yearStr = rawYear.toString();
    formattedYear = yearStr.slice(-2);
  }
  const origin = process.origin ?? '';
  
  const main = [typeAbbreviation, formattedNumber].filter(Boolean).join(' ').trim();
  const yearSection = formattedYear ? `/${formattedYear}` : '';
  const right = origin ? ` - ${origin}` : '';
  
  return `${main}${yearSection}${right}`.trim() || '--';
};

const ProvidenciasPopover = ({ pendingActions, completedActions }) => {
  return (
    <div className="absolute bg-yellow-100 border border-gray-300 rounded-lg shadow-md p-4 mt-2">
      <span className="font-semibold text-gray-900">Providências Pendentes</span>
      <ul className="space-y-1 mt-2">
        {pendingActions.map((action, index) => (
          <li key={index} className={`flex items-center ${completedActions.includes(action) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            <span className="mr-2">{completedActions.includes(action) ? '✔️' : '❌'}</span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
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
  const [showPopover, setShowPopover] = useState(false);
  const statusInfo = getStatusInfo(process.dueDate);

  const pendingActions = process.pending_actions || process.pendingActions || [];
  const pendingCount = pendingActions.length - completedActions.length;

  return (
    <div
      className="relative bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:scale-105 duration-300 p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200"
      onClick={onClick}
    >
      <div className="space-y-3">
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo.circleColor}`}></div>
          <span className="text-blue-dark font-arial font-semibold text-lg text-blue-600">
            {formatProcessNumber(process)}
          </span>
        </div>

        <div className="text-black text-sm font-arial">
          {process.summary || '--'}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="font-bold text-gray-800 text-sm">Vencimento:</span>
          <span className={`${statusInfo.dateColor} font-medium`}>
            {format(parseISO(process.dueDate), "dd/MM/yyyy", {
              locale: ptBR
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-base font-semibold text-gray-900">Status:</span>
          <span className="font-bold text-gray-700">{process.status}</span>
        </div>

        {pendingActions.length > 0 && (
          <div className="relative flex items-center gap-2 text-xs"
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
          >
            <ListTodo className="w-3 h-3 text-orange-500" />
            <span className="font-semibold text-sm text-gray-900">Providências:</span>
            <span className="text-orange-600 font-medium">
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
            {showPopover && (
              <ProvidenciasPopover
                pendingActions={pendingActions}
                completedActions={completedActions}
              />
            )}
          </div>
        )}

        {process.forwarding && ensureArray(process.forwarding).map((item: string, index: number) => (
          <div key={index} className="text-xs">
            <span className={`px-2 py-1 rounded ${getForwardingColor(item)}`}>
              {item}
            </span>
          </div>
        ))}

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
  );
};

export default ProcessCard;


