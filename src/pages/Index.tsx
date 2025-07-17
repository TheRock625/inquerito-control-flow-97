
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Clock, AlertTriangle, CheckCircle, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewProcessModal from '@/components/NewProcessModal';
import ProcessCard from '@/components/ProcessCard';
import ProcessDetailsModal from '@/components/ProcessDetailsModal';
import { differenceInDays, parseISO } from 'date-fns';
import { useProcesses } from '@/hooks/useProcesses';
import { useCompletedActions } from '@/hooks/useCompletedActions';


const Index = () => {
  const { processes, addProcess, updateProcess, deleteProcess } = useProcesses();
  const { completedActions, toggleActionCompletion } = useCompletedActions();
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'dueSoon' | 'completed'>('all');

  const handleSaveNewProcess = async (newProcess: any) => {
    await addProcess(newProcess);
  };

  const handleCompleteAction = async (processId: string, actionText: string) => {
    await toggleActionCompletion(processId, actionText);
  };

  const handleDeleteProcess = async (processId: string) => {
    await deleteProcess(processId);
    setSelectedProcess(null);
  };

  const handleSaveProcess = async (processId: string, editData: any) => {
    await updateProcess(processId, editData);
    
    const updatedProcess = processes.find(p => p.id === processId);
    if (updatedProcess) {
      setSelectedProcess({
        ...updatedProcess,
        dueDate: updatedProcess.due_date,
        pendingActions: updatedProcess.pending_actions || []
      });
    }
  };

  // Calculate statistics
  const totalProcesses = processes.length;
  const overdueProcesses = processes.filter(p => {
    const daysDiff = differenceInDays(parseISO(p.due_date), new Date());
    return daysDiff < 0 && p.forwarding !== 'TJDFT' && p.forwarding !== 'MPDFT';
  }).length;
  const dueSoonProcesses = processes.filter(p => {
    const daysDiff = differenceInDays(parseISO(p.due_date), new Date());
    return daysDiff >= 0 && daysDiff <= 2 && p.forwarding !== 'TJDFT' && p.forwarding !== 'MPDFT';
  }).length;
  const completedProcesses = processes.filter(p => 
    p.status.toUpperCase() === 'RELATADO'
  ).length;

  // Filter processes based on selected filter
  const getFilteredProcesses = () => {
    switch (filterType) {
      case 'overdue':
        return processes.filter(p => {
          const daysDiff = differenceInDays(parseISO(p.due_date), new Date());
          return daysDiff < 0 && p.forwarding !== 'TJDFT' && p.forwarding !== 'MPDFT';
        });
      case 'dueSoon':
        return processes.filter(p => {
          const daysDiff = differenceInDays(parseISO(p.due_date), new Date());
          return daysDiff >= 0 && daysDiff <= 2 && p.forwarding !== 'TJDFT' && p.forwarding !== 'MPDFT';
        });
      case 'completed':
        return processes.filter(p => p.status.toUpperCase() === 'RELATADO');
      default:
        return processes;
    }
  };

  const filteredProcesses = getFilteredProcesses();

  const getFilterTitle = () => {
    switch (filterType) {
      case 'overdue': return 'Processos Vencidos';
      case 'dueSoon': return 'Processos com Vencimento Próximo';
      case 'completed': return 'Processos Relatados';
      default: return 'Todos os Processos';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with dark blue background */}
      <div className="bg-header-bg border-b border-border px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-header-foreground">Sistema IP/TC</h1>
            <p className="text-header-foreground/80 mt-1">Controle de Inquéritos</p>
          </div>
          <Button 
            className="bg-button-primary hover:bg-button-primary-hover text-white transition-colors duration-200"
            onClick={() => setIsNewProcessModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <NewProcessModal
          open={isNewProcessModalOpen}
          onClose={() => setIsNewProcessModalOpen(false)}
          onSave={handleSaveNewProcess}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="bg-primary/10 border-primary/20 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => setFilterType('all')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total de Processos</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalProcesses}</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-destructive/10 border-destructive/20 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => setFilterType('overdue')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{overdueProcesses}</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-yellow-50 border-yellow-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => setFilterType('dueSoon')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Vencidos Próximos</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{dueSoonProcesses}</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-green-50 border-green-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => setFilterType('completed')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Relatados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{completedProcesses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Processes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{getFilterTitle()}</CardTitle>
                <CardDescription>
                  {filterType === 'all' 
                    ? 'Últimos inquéritos, termos circunstanciados e PAAIs cadastrados'
                    : `Mostrando ${filteredProcesses.length} ${filteredProcesses.length === 1 ? 'processo' : 'processos'}`
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {filterType !== 'all' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    Limpar Filtro
                  </Button>
                )}
                <Link to="/processos">
                  <Button variant="outline">
                    <List className="w-4 h-4 mr-2" />
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProcesses.map((process) => (
                <ProcessCard
                  key={process.id}
                    process={{
                      ...process,
                      dueDate: process.dueDate || process.due_date,
                      pendingActions: process.pendingActions || process.pending_actions || []
                    }}
                   completedActions={completedActions[process.id] || []}
                     onClick={() => {
                       console.log('Clicking on process:', process);
                       const processWithDates = {
                         ...process,
                         dueDate: process.dueDate || process.due_date,
                         pendingActions: process.pendingActions || process.pending_actions || []
                       };
                       console.log('Setting selectedProcess:', processWithDates);
                       setSelectedProcess(processWithDates);
                     }}
                     onEdit={() => {}}
                 />
              ))}
            </div>
            
            {filteredProcesses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum processo encontrado para este filtro.</p>
                  <p className="text-sm">Clique em "Limpar Filtro" para ver todos os processos.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
