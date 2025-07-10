import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ProcessActionButtonsProps {
  process: any;
  isEditMode: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteProcess: (processId: string) => void;
}

const ProcessActionButtons = ({
  process,
  isEditMode,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteProcess
}: ProcessActionButtonsProps) => {
  return (
    <div className="flex justify-between">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            Excluir Processo
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O processo {process.number} será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteProcess(process.id)}>
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex gap-2">
        {isEditMode ? (
          <>
            <Button variant="outline" onClick={onCancelEdit}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={onSaveEdit}
            >
              Salvar
            </Button>
          </>
        ) : (
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onStartEdit}
          >
            Alterar Detalhes
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProcessActionButtons;