// Wrapper para Tauri v1.6.x API
import { invoke } from '@tauri-apps/api/tauri';

// Interfaces para compatibilidade
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

// Funções para interagir com o backend Tauri v1.6.x
export async function getAllProcesses(): Promise<TauriProcess[]> {
  return invoke('get_all_processes');
}

export async function addProcess(processData: TauriProcessData): Promise<TauriProcess> {
  return invoke('add_process', { processData });
}

export async function updateProcess(processId: string, updates: TauriProcessUpdates): Promise<TauriProcess> {
  return invoke('update_process', { processId, updates });
}

export async function deleteProcess(processId: string): Promise<void> {
  return invoke('delete_process', { processId });
}

export async function getCompletedActions(): Promise<{[processId: string]: string[]}> {
  return invoke('get_completed_actions');
}

export async function toggleActionCompletion(processId: string, actionText: string): Promise<boolean> {
  return invoke('toggle_action_completion', { processId, actionText });
}