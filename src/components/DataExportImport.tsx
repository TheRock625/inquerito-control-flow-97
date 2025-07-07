
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Import, Export } from 'lucide-react';
import { exportProcessData, importProcessData } from '@/utils/dataExport';
import { useToast } from '@/hooks/use-toast';

interface DataExportImportProps {
  onDataImported?: (processes: any[], completedActions: any) => void;
}

const DataExportImport = ({ onDataImported }: DataExportImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportProcessData();
      toast({
        title: "Exportação realizada",
        description: "Os dados foram exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const { processes, completedActions } = await importProcessData(file);
      
      // Atualizar dados globais
      (window as any).sharedProcesses = processes;
      (window as any).sharedCompletedActions = completedActions;
      
      // Notificar componentes sobre a importação
      if (onDataImported) {
        onDataImported(processes, completedActions);
      }
      
      toast({
        title: "Importação realizada",
        description: `${processes.length} processos foram importados com sucesso!`,
      });
      
      // Recarregar a página para atualizar todos os componentes
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Limpar o input para permitir importar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="w-full justift-start"
      >
        <Export className="w-4 h-4 mr-2" />
        Exportar Base
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isImporting}
        className="w-full justify-start"
      >
        <Import className="w-4 h-4 mr-2" />
        {isImporting ? 'Importando...' : 'Importar Base'}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default DataExportImport;
