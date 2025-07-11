
export const getForwardingColor = (forwarding: string) => {
  switch (forwarding) {
    case 'Delta 01': return 'bg-red-100 text-red-800';
    case 'Delta 02': return 'bg-blue-100 text-blue-800';
    case 'Delta 03': return 'bg-green-100 text-green-800';
    case 'MPDFT': return 'bg-purple-100 text-purple-800';
    case 'TJDFT': return 'bg-indigo-100 text-indigo-800';
    case 'CONCLUIDO': return 'bg-emerald-100 text-emerald-800';
    case 'RELATADO': return 'bg-emerald-100 text-emerald-800';
    case 'Escrivão': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
