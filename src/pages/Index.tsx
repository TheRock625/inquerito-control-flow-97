
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Clock, AlertTriangle, CheckCircle, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewProcessModal from '@/components/NewProcessModal';
import ProcessCard from '@/components/ProcessCard';
import ProcessDetailsModal from '@/components/ProcessDetailsModal';
import { differenceInDays, parseISO } from 'date-fns';

// Mock data
const initialMockProcesses = [
  {
    id: 1,
    number: "IP 210/25 - 05ª DP",
    type: "IP",
    status: "Em Diligência",
    dueDate: "2025-01-15",
    forwarding: "Delta 02",
    pendingActions: [
      "Solicitar perícia técnica",
      "Ouvir testemunha adicional"
    ],
    completedActions: []
  },
  {
    id: 2,
    number: "TC 45/25 - 10ª DP",
    type: "TC",
    status: "Aguardando Oitiva",
    dueDate: "2025-01-08",
    forwarding: "Delta 01",
    pendingActions: [
      "Agendar oitiva do autor"
    ],
    completedActions: []
  },
  {
    id: 3,
    number: "PAAI 12/25 - 15ª DP",
    type: "PAAI",
    status: "RELATADO",
    dueDate: "2025-01-20",
    forwarding: "Delta 03",
    pendingActions: [],
    completedActions: [
      { action: "Coleta de depoimentos", date: "2025-01-05" },
      { action: "Análise documental", date: "2025-01-06" }
    ]
  }
];

// Initialize shared data
if (!(window as any).sharedProcesses) {
  (window as any).sharedProcesses = initialMockProcesses;
}
if (!(window as any).sharedCompletedActions) {
  (window as any).sharedCompletedActions = {};
}

const Index = () => {
  const [mockProcesses, setMockProcesses] = useState(() => (window as any).sharedProcesses || []);
  const [completedActions, setCompletedActions] = useState<{[key: number]: number[]}>(() => (window as any).sharedCompletedActions || {});
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'dueSoon' | 'completed'>('all');

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

  const handleCompleteAction = (processId: number, actionIndex: number) => {
    const process = mockProcesses.find(p => p.id === processId);
    if (!process) return;

    const action = process.pendingActions[actionIndex];
    const isCurrentlyCompleted = completedActions[processId]?.includes(actionIndex);
    
    const newCompletedActions = {
      ...completedActions,
      [processId]: isCurrentlyCompleted 
        ? completedActions[processId].filter(idx => idx !== actionIndex)
        : [...(completedActions[processId] || []), actionIndex]
    };
    setCompletedActions(newCompletedActions);
    (window as any).sharedCompletedActions = newCompletedActions;

    // Atualizar histórico do processo
    const updatedProcesses = mockProcesses.map(p => {
      if (p.id === processId) {
        let newCompletedActionsHistory = [...p.completedActions];
        
        if (isCurrentlyCompleted) {
          newCompletedActionsHistory = newCompletedActionsHistory.filter(
            item => !(item.action === action && item.date === new Date().toISOString().split('T')[0])
          );
        } else {
          newCompletedActionsHistory.push({
            action: action,
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

  const handleDeleteProcess = (processId: number) => {
    const updatedProcesses = mockProcesses.filter(p => p.id !== processId);
    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
    setSelectedProcess(null);
  };

  const handleSaveProcess = (processId: number, editData: any) => {
    const updatedProcesses = mockProcesses.map(p => {
      if (p.id === processId) {
        return {
          ...p,
          status: editData.status,
          dueDate: editData.dueDate,
          forwarding: editData.forwarding,
          pendingActions: editData.pendingActions,
          summary: editData.summary
        };
      }
      return p;
    });

    setMockProcesses(updatedProcesses);
    (window as any).sharedProcesses = updatedProcesses;
    
    const updatedProcess = updatedProcesses.find(p => p.id === processId);
    setSelectedProcess(updatedProcess);
  };

  // Calculate statistics
  const totalProcesses = mockProcesses.length;
  const overdueProcesses = mockProcesses.filter(p => {
    const daysDiff = differenceInDays(parseISO(p.dueDate), new Date());
    return daysDiff < 0;
  }).length;
  const dueSoonProcesses = mockProcesses.filter(p => {
    const daysDiff = differenceInDays(parseISO(p.dueDate), new Date());
    return daysDiff >= 0 && daysDiff <= 2;
  }).length;
  const completedProcesses = mockProcesses.filter(p => 
    p.status.toUpperCase() === 'RELATADO'
  ).length;

  // Filter processes based on selected filter
  const getFilteredProcesses = () => {
    switch (filterType) {
      case 'overdue':
        return mockProcesses.filter(p => {
          const daysDiff = differenceInDays(parseISO(p.dueDate), new Date());
          return daysDiff < 0;
        });
      case 'dueSoon':
        return mockProcesses.filter(p => {
          const daysDiff = differenceInDays(parseISO(p.dueDate), new Date());
          return daysDiff >= 0 && daysDiff <= 2;
        });
      case 'completed':
        return mockProcesses.filter(p => p.status.toUpperCase() === 'RELATADO');
      default:
        return mockProcesses;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with gray background */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema IP/TC</h1>
            <p className="text-gray-600 mt-1">Controle de Inquéritos</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
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
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => setFilterType('all')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total de Processos</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalProcesses}</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
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
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
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
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProcesses.map((process) => (
                <ProcessCard
                  key={process.id}
                  process={process}
                  onClick={() => setSelectedProcess(process)}
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
