
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Home } from 'lucide-react';
import NewProcessModal from '@/components/NewProcessModal';
import EditProcessModal from '@/components/EditProcessModal';
import ProcessCard from '@/components/ProcessCard';
import ProcessFilters from '@/components/ProcessFilters';
import ProcessDetailsModal from '@/components/ProcessDetailsModal';
import { Link } from 'react-router-dom';

// Access shared data from Index.tsx
declare global {
  var sharedProcesses: any[];
  var sharedCompletedActions: {[processId: string]: string[]};
}

const Processos = () => {
  // Access shared data from window
  const [mockProcesses, setMockProcesses] = useState(() => (window as any).sharedProcesses || []);
  const [completedActions, setCompletedActions] = useState<{[processId: string]: string[]}>(() => (window as any).sharedCompletedActions || {});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [forwardingFilter, setForwardingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<any>(null);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);

  // Update shared data when local state changes
  useEffect(() => {
    (window as any).sharedProcesses = mockProcesses;
  }, [mockProcesses]);

  useEffect(() => {
    (window as any).sharedCompletedActions = completedActions;
  }, [completedActions]);

  const handleSaveNewProcess = (newProcess: any) => {
    const updatedProcesses = [...mockProcesses, newProcess];
    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
  };

  const handleSaveEditProcess = (updatedProcess: any) => {
    const updatedProcesses = mockProcesses.map(p => p.id === updatedProcess.id ? updatedProcess : p);
    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
  };

  const handleDeleteProcess = (processId: string) => {
    const updatedProcesses = mockProcesses.filter(p => p.id !== processId);
    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
    setSelectedProcess(null);
  };

  const handleCompleteAction = (processId: string, actionText: string) => {
    const process = mockProcesses.find(p => p.id === processId);
    if (!process) return;

    const isCurrentlyCompleted = completedActions[processId]?.includes(actionText);
    
    const newCompletedActions = {
      ...completedActions,
      [processId]: isCurrentlyCompleted 
        ? completedActions[processId].filter(action => action !== actionText)
        : [...(completedActions[processId] || []), actionText]
    };
    setCompletedActions(newCompletedActions);
    (window as any).sharedCompletedActions = newCompletedActions;

    // Atualizar histórico do processo
    const updatedProcesses = mockProcesses.map(p => {
      if (p.id === processId) {
        let newCompletedActionsHistory = [...p.completedActions];
        
        if (isCurrentlyCompleted) {
          // Remover do histórico
          newCompletedActionsHistory = newCompletedActionsHistory.filter(
            item => !(item.action === actionText && item.date === new Date().toISOString().split('T')[0])
          );
        } else {
          // Adicionar ao histórico
          newCompletedActionsHistory.push({
            action: actionText,
            date: new Date().toISOString().split('T')[0]
          });
        }
        
        return {
          ...p,
          completedActions: newCompletedActionsHistory
        };
      }
      return p;
    });
    
    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
  };

  const handleSaveProcess = (processId: string, editData: any) => {
    const updatedProcesses = mockProcesses.map(p => {
      if (p.id === processId) {
        return {
          ...p,
          status: editData.status,
          dueDate: editData.dueDate,
          forwarding: editData.forwarding,
          pendingActions: editData.pendingActions
        };
      }
      return p;
    });

    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
    
    // Update selected process for modal
    const updatedProcess = updatedProcesses.find(p => p.id === processId);
    setSelectedProcess(updatedProcess);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setForwardingFilter('all');
    setSortBy('dueDate');
  };

  const filteredProcesses = useMemo(() => {
    return mockProcesses
      .filter(process => {
        const matchesSearch = process.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || process.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
        const matchesForwarding = forwardingFilter === 'all' || process.forwarding === forwardingFilter;
        
        return matchesSearch && matchesType && matchesStatus && matchesForwarding;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'number') {
          return a.number.localeCompare(b.number);
        }
        return 0;
      });
  }, [mockProcesses, searchTerm, typeFilter, statusFilter, forwardingFilter, sortBy]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processos</h1>
          <p className="text-gray-600">Gerenciamento completo de IPs, TCs e PAAIs</p>
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewProcessModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      <NewProcessModal
        open={isNewProcessModalOpen}
        onClose={() => setIsNewProcessModalOpen(false)}
        onSave={handleSaveNewProcess}
      />

      <EditProcessModal
        open={!!editingProcess}
        onClose={() => setEditingProcess(null)}
        process={editingProcess}
        onSave={handleSaveEditProcess}
      />

      <ProcessDetailsModal
        process={selectedProcess}
        open={!!selectedProcess}
        onClose={() => setSelectedProcess(null)}
        completedActions={completedActions}
        onCompleteAction={handleCompleteAction}
        onDeleteProcess={handleDeleteProcess}
        onSaveProcess={handleSaveProcess}
      />

      <ProcessFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        forwardingFilter={forwardingFilter}
        setForwardingFilter={setForwardingFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={clearFilters}
      />

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredProcesses.length} processo{filteredProcesses.length !== 1 ? 's' : ''} encontrado{filteredProcesses.length !== 1 ? 's' : ''}
          </h2>
        </div>
        
        {filteredProcesses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Nenhum processo encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcesses.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                onClick={() => setSelectedProcess(process)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Processos;
