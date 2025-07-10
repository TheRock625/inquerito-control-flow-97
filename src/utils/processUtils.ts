import { format, parseISO, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getStatusColor = (status: string) => {
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

export const getDueDateColor = (dueDate: string) => {
  if (!dueDate) return 'text-gray-600';
  
  try {
    const today = new Date();
    const due = parseISO(dueDate);
    const daysDiff = differenceInDays(due, today);
    
    if (daysDiff < 0) return 'text-red-600 font-bold';
    if (daysDiff <= 2) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  } catch (error) {
    return 'text-gray-600';
  }
};

export const isWeekend = (dueDate: string) => {
  if (!dueDate) return false;
  
  try {
    const due = parseISO(dueDate);
    const dayOfWeek = getDay(due);
    return dayOfWeek === 0 || dayOfWeek === 6;
  } catch (error) {
    return false;
  }
};

export const shouldShowAlert = (dueDate: string) => {
  if (!dueDate) return false;
  
  try {
    const today = new Date();
    const due = parseISO(dueDate);
    const daysDiff = differenceInDays(due, today);
    return daysDiff <= 2 || isWeekend(dueDate);
  } catch (error) {
    return false;
  }
};

export const formatDueDate = (dueDate: string) => {
  if (!dueDate) return 'Data não informada';
  
  try {
    return format(parseISO(dueDate), "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return dueDate;
  }
};