
export const getForwardingColor = (forwarding: string) => {
  switch (forwarding) {
    case 'Delta 01': return 'bg-green-100 text-green-700';
    case 'Delta 02': return 'bg-yellow-100 text-yellow-700';
    case 'Delta 03': return 'bg-violet-100 text-violet-700';
    case 'MPDFT': return 'bg-purple-100 text-purple-700';
    case 'TJDFT': return 'bg-purple-200 text-purple-800';
    case 'CONCLUIDO': return 'bg-emerald-100 text-emerald-800';
    case 'RELATADO': return 'bg-green-100 text-green-700';
    case 'Escrivão': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-800';
  }
};
