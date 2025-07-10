import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Home } from 'lucide-react';
import NewProcessModal from '@/components/NewProcessModal';
import EditProcessModal from '@/components/EditProcessModal';
import ProcessCard from '@/components/ProcessCard';
import ProcessFilters from '@/components/ProcessFilters';
import ProcessDetailsModal from '@/components/ProcessDetailsModal';
import { Link } from 'react-router-dom';
import { useProcesses } from '@/hooks/useProcesses';
import { useCompletedActions } from '@/hooks/useCompletedActions';

const Processos = () => {
  const { processes, addProcess, updateProcess, deleteProcess } = useProcesses();
  const { completedActions, toggleActionCompletion } = useCompletedActions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [forwardingFilter, setForwardingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<any>(null);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);

  const handleSaveNewProcess = async (newProcess: any) => {
    await addProcess(newProcess);
  };

  const handleSaveEditProcess = async (updatedProcess: any) => {
    await updateProcess(updatedProcess.id, {
      status: updatedProcess.status,
      dueDate: updatedProcess.dueDate,
      forwarding: updatedProcess.forwarding,
      summary: updatedProcess.summary,
      pendingActions: updatedProcess.pendingActions
    });
    setEditingProcess(null);
  };

  const handleDeleteProcess = async (processId: string) => {
    await deleteProcess(processId);
    setSelectedProcess(null);
  };

  const handleCompleteAction = async (processId: string, actionText: string) => {
    await toggleActionCompletion(processId, actionText);
  };

  const handleSaveProcess = async (processId: string, editData: any) => {
    const updatedProcessData = await updateProcess(processId, editData);
    
    // Use os dados retornados diretamente para atualizar o selectedProcess
    if (updatedProcessData) {
      setSelectedProcess({
        ...updatedProcessData,
        dueDate: updatedProcessData.due_date,
        pendingActions: Array.isArray(updatedProcessData.pending_actions) 
          ? updatedProcessData.pending_actions.filter((item: any) => typeof item === 'string') 
          : []
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setForwardingFilter('all');
    setSortBy('dueDate');
  };

  const filteredProcesses = useMemo(() => {
    return processes
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
  }, [processes, searchTerm, typeFilter, statusFilter, forwardingFilter, sortBy]);

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
                process={{
                  ...process,
                  dueDate: process.dueDate,
                  pendingActions: process.pendingActions
                }}
                completedActions={completedActions[process.id] || []}
                onClick={() => setSelectedProcess({
                  ...process,
                  dueDate: process.dueDate,
                  pendingActions: process.pendingActions || []
                })}
                onEdit={() => setEditingProcess({
                  ...process,
                  dueDate: process.dueDate,
                  pendingActions: process.pendingActions || []
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Processos;
