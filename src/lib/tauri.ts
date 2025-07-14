// Tauri API wrapper for type safety - Mock for development
declare global {
  interface Window {
    __TAURI__: any;
  }
}

const invoke = (command: string, args?: any): Promise<any> => {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return window.__TAURI__.invoke(command, args);
  }
  // Mock for development - return empty data
  console.warn(`Tauri command '${command}' called in non-Tauri environment`);
  return Promise.resolve([]);
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
  invoke('get_all_processes');

export const addProcess = (processData: TauriProcessData): Promise<TauriProcess> =>
  invoke('add_process', { processData });

export const updateProcess = (processId: string, updates: TauriProcessUpdates): Promise<TauriProcess> =>
  invoke('update_process', { processId, updates });

export const deleteProcess = (processId: string): Promise<void> =>
  invoke('delete_process', { processId });

// Completed actions operations
export const getCompletedActions = (): Promise<{[processId: string]: string[]}> =>
  invoke('get_completed_actions');

export const toggleActionCompletion = (processId: string, actionText: string): Promise<boolean> =>
  invoke('toggle_action_completion', { processId, actionText });