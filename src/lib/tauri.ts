// Tauri API wrapper for type safety - Mock for development
// Import para Tauri v1.6.x
import { invoke } from '@tauri-apps/api/tauri';

// Remover declaração global pois já existe no @tauri-apps/api

// Mock data for development
const mockProcesses: TauriProcess[] = [
  {
    id: '1',
    number: '001/2024',
    type: 'Inquérito Policial',
    status: 'Em andamento',
    due_date: '2024-12-31',
    forwarding: 'Delegacia Central',
    pending_actions: ['Colher depoimento', 'Análise pericial', 'Elaborar relatório'],
    summary: 'Processo de investigação sobre furto qualificado',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    number: '002/2024',
    type: 'Termo Circunstanciado',
    status: 'Aguardando',
    due_date: '2024-11-30',
    forwarding: '1ª Vara Criminal',
    pending_actions: ['Intimar testemunhas', 'Agendar audiência'],
    summary: 'TC referente a contravenção penal',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T14:00:00Z'
  }
];

let mockCompletedActions: {[processId: string]: string[]} = {
  '1': ['Colher depoimento'],
  '2': []
};

const tauriInvoke = (command: string, args?: any): Promise<any> => {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return invoke(command, args);
  }
  
  // Mock implementation for development
  console.info(`Mock Tauri command: ${command}`, args);
  
  switch (command) {
    case 'get_all_processes':
      return Promise.resolve([...mockProcesses]);
    
    case 'add_process':
      const newProcess: TauriProcess = {
        id: Date.now().toString(),
        ...args.processData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockProcesses.push(newProcess);
      return Promise.resolve(newProcess);
    
    case 'update_process':
      const processIndex = mockProcesses.findIndex(p => p.id === args.processId);
      if (processIndex !== -1) {
        mockProcesses[processIndex] = {
          ...mockProcesses[processIndex],
          ...args.updates,
          updated_at: new Date().toISOString()
        };
        return Promise.resolve(mockProcesses[processIndex]);
      }
      throw new Error('Process not found');
    
    case 'delete_process':
      const deleteIndex = mockProcesses.findIndex(p => p.id === args.processId);
      if (deleteIndex !== -1) {
        mockProcesses.splice(deleteIndex, 1);
        delete mockCompletedActions[args.processId];
      }
      return Promise.resolve();
    
    case 'get_completed_actions':
      return Promise.resolve({...mockCompletedActions});
    
    case 'toggle_action_completion':
      const { processId, actionText } = args;
      if (!mockCompletedActions[processId]) {
        mockCompletedActions[processId] = [];
      }
      
      const isCompleted = mockCompletedActions[processId].includes(actionText);
      if (isCompleted) {
        mockCompletedActions[processId] = mockCompletedActions[processId].filter(a => a !== actionText);
      } else {
        mockCompletedActions[processId].push(actionText);
      }
      return Promise.resolve(!isCompleted);
    
    default:
      console.warn(`Unknown Tauri command: ${command}`);
      return Promise.resolve(null);
  }
};

export interface TauriProcess {
  id: string;
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  pending_actions: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface TauriProcessData {
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  pending_actions: string[];
  summary?: string;
}

export interface TauriProcessUpdates {
  number?: string;
  type?: string;
  status?: string;
  due_date?: string;
  forwarding?: string;
  pending_actions?: string[];
  summary?: string;
}

// Processo CRUD operations
export const getAllProcesses = (): Promise<TauriProcess[]> =>
  tauriInvoke('get_all_processes');

export const addProcess = (processData: TauriProcessData): Promise<TauriProcess> =>
  tauriInvoke('add_process', { processData });

export const updateProcess = (processId: string, updates: TauriProcessUpdates): Promise<TauriProcess> =>
  tauriInvoke('update_process', { processId, updates });

export const deleteProcess = (processId: string): Promise<void> =>
  tauriInvoke('delete_process', { processId });

// Completed actions operations
export const getCompletedActions = (): Promise<{[processId: string]: string[]}> =>
  tauriInvoke('get_completed_actions');

export const toggleActionCompletion = (processId: string, actionText: string): Promise<boolean> =>
  tauriInvoke('toggle_action_completion', { processId, actionText });