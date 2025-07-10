// Utility functions to transform process data between snake_case (Supabase) and camelCase (Frontend)

import { Json } from '@/integrations/supabase/types';

// Database process type (snake_case) - matches Supabase schema
export interface DbProcess {
  id: string;
  number: string;
  type: string;
  status: string;
  due_date: string;
  forwarding: string;
  pending_actions: Json | null;
  summary?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Frontend process type (camelCase)
export interface FrontendProcess {
  id: string;
  number: string;
  type: string;
  status: string;
  dueDate: string;
  forwarding: string;
  pendingActions: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Transform from database format to frontend format
export const transformDbToFrontend = (dbProcess: DbProcess): FrontendProcess => {
  // Safely transform pending_actions to string array
  let pendingActions: string[] = [];
  if (Array.isArray(dbProcess.pending_actions)) {
    pendingActions = dbProcess.pending_actions.filter((item): item is string => typeof item === 'string');
  }

  return {
    ...dbProcess,
    dueDate: dbProcess.due_date,
    pendingActions,
    summary: dbProcess.summary || ''
  };
};

// Transform from frontend format to database format
export const transformFrontendToDb = (frontendProcess: Partial<FrontendProcess>): Partial<Omit<DbProcess, 'id' | 'created_at' | 'updated_at'>> => {
  const dbProcess: any = { ...frontendProcess };
  
  if (frontendProcess.dueDate) {
    dbProcess.due_date = frontendProcess.dueDate;
    delete dbProcess.dueDate;
  }
  
  if (frontendProcess.pendingActions !== undefined) {
    dbProcess.pending_actions = frontendProcess.pendingActions;
    delete dbProcess.pendingActions;
  }
  
  // Remove readonly properties
  delete dbProcess.id;
  delete dbProcess.created_at;
  delete dbProcess.updated_at;
  
  return dbProcess;
};

// Transform array of processes from DB to frontend
export const transformDbArrayToFrontend = (dbProcesses: DbProcess[]): FrontendProcess[] => {
  return dbProcesses.map(transformDbToFrontend);
};