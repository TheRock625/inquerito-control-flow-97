
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ConfigContextType {
  origins: string[];
  statuses: string[];
  forwardings: string[];
  addOrigin: (origin: string) => void;
  addStatus: (status: string) => void;
  addForwarding: (forwarding: string) => void;
  removeOrigin: (origin: string) => void;
  removeStatus: (status: string) => void;
  removeForwarding: (forwarding: string) => void;
  reorderOrigins: (startIndex: number, endIndex: number) => void;
  reorderStatuses: (startIndex: number, endIndex: number) => void;
  reorderForwardings: (startIndex: number, endIndex: number) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const defaultOrigins = Array.from({ length: 35 }, (_, i) => {
  const dpNumber = String(i + 1).padStart(2, '0');
  return `${dpNumber}ª DP`;
});

const defaultStatuses = [
  'Aguardando Oitiva',
  'Em Diligência', 
  'Pronto para Relatar',
  'Aguardando Perícia',
  'RELATADO'
];

const defaultForwardings = [
  'Em Andamento',
  'MPDFT',
  'TJDFT',
  'Delta 01',
  'Delta 02', 
  'Delta 03',
  'RELATADO'
];

// Global shared data
if (!(window as any).sharedProcesses) {
  (window as any).sharedProcesses = [
    {
      id: 1,
      number: "IP 123/24 - 12ª DP",
      type: "IP",
      status: "Aguardando Oitiva",
      dueDate: "2024-07-07",
      forwarding: "Em Andamento",
      pendingActions: ["Ouvir testemunha João Silva", "Solicitar exame pericial"],
      completedActions: [
        { action: "Abertura do IP", date: "2024-06-15" },
        { action: "Coleta inicial de depoimentos", date: "2024-06-20" }
      ]
    },
    {
      id: 2,
      number: "TC 89/24 - 05ª DP",
      type: "TC",
      status: "Em Diligência",
      dueDate: "2024-07-06",
      forwarding: "MPDFT",
      pendingActions: ["Notificar envolvidos", "Juntar documentos"],
      completedActions: [
        { action: "Registro da ocorrência", date: "2024-05-10" },
        { action: "Oitiva das partes", date: "2024-05-15" }
      ]
    },
    {
      id: 3,
      number: "IP 67/24 - 18ª DP",
      type: "IP",
      status: "RELATADO",
      dueDate: "2024-07-08",
      forwarding: "RELATADO",
      pendingActions: [],
      completedActions: [
        { action: "Investigação completa", date: "2024-06-01" },
        { action: "Conclusão das diligências", date: "2024-06-25" }
      ]
    },
    {
      id: 4,
      number: "PAAI 201/25 - 24ª DP",
      type: "PAAI",
      status: "Aguardando Perícia",
      dueDate: "2024-07-04",
      forwarding: "Delta 01",
      pendingActions: ["Aguardar resultado da perícia", "Complementar auto"],
      completedActions: [
        { action: "Solicitação de perícia", date: "2024-06-10" }
      ]
    }
  ];
}

if (!(window as any).sharedCompletedActions) {
  (window as any).sharedCompletedActions = {};
}

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [origins, setOrigins] = useState<string[]>(defaultOrigins);
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses);
  const [forwardings, setForwardings] = useState<string[]>(defaultForwardings);

  const addOrigin = (origin: string) => {
    if (!origins.includes(origin)) {
      setOrigins(prev => [...prev, origin]);
    }
  };

  const addStatus = (status: string) => {
    if (!statuses.includes(status)) {
      setStatuses(prev => [...prev, status]);
    }
  };

  const addForwarding = (forwarding: string) => {
    if (!forwardings.includes(forwarding)) {
      setForwardings(prev => [...prev, forwarding]);
    }
  };

  const removeOrigin = (origin: string) => {
    setOrigins(prev => prev.filter(o => o !== origin));
  };

  const removeStatus = (status: string) => {
    setStatuses(prev => prev.filter(s => s !== status));
  };

  const removeForwarding = (forwarding: string) => {
    setForwardings(prev => prev.filter(f => f !== forwarding));
  };

  const reorderItems = (items: string[], startIndex: number, endIndex: number) => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const reorderOrigins = (startIndex: number, endIndex: number) => {
    setOrigins(prev => reorderItems(prev, startIndex, endIndex));
  };

  const reorderStatuses = (startIndex: number, endIndex: number) => {
    setStatuses(prev => reorderItems(prev, startIndex, endIndex));
  };

  const reorderForwardings = (startIndex: number, endIndex: number) => {
    setForwardings(prev => reorderItems(prev, startIndex, endIndex));
  };

  return (
    <ConfigContext.Provider value={{
      origins,
      statuses,
      forwardings,
      addOrigin,
      addStatus,
      addForwarding,
      removeOrigin,
      removeStatus,
      removeForwarding,
      reorderOrigins,
      reorderStatuses,
      reorderForwardings
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
