
// Função para exportar dados para um arquivo JSON
export const exportProcessData = (processes?: any[], completedActions?: any) => {
  // Se não foram passados parâmetros, usar os dados do window
  const processesToExport = processes || (window as any).sharedProcesses || [];
  const actionsToExport = completedActions || (window as any).sharedCompletedActions || {};
  
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      processes: processesToExport,
      completedActions: actionsToExport
    }
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `processos_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

// Função para importar dados de um arquivo JSON
export const importProcessData = (file: File): Promise<{ processes: any[], completedActions: any }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importData = JSON.parse(result);
        
        // Validar estrutura do arquivo
        if (!importData.data || !importData.data.processes) {
          throw new Error('Formato de arquivo inválido');
        }
        
        resolve({
          processes: importData.data.processes || [],
          completedActions: importData.data.completedActions || {}
        });
      } catch (error) {
        reject(new Error('Erro ao ler arquivo: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};
