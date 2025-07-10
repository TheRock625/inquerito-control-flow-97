import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PendingActionsCardProps {
  process: any;
  isEditMode: boolean;
  completedActions: string[];
  newPendingAction: string;
  onNewPendingActionChange: (value: string) => void;
  onAddPendingAction: () => void;
  onRemovePendingAction: (index: number) => void;
  onCompleteAction: (processId: string, actionText: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const PendingActionsCard = ({
  process,
  isEditMode,
  completedActions,
  newPendingAction,
  onNewPendingActionChange,
  onAddPendingAction,
  onRemovePendingAction,
  onCompleteAction,
  onKeyPress
}: PendingActionsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Providências Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        {(process.pendingActions || process.pending_actions || []).length > 0 ? (
          <div className="space-y-2">
            {(process.pendingActions || process.pending_actions || []).map((action: string, index: number) => {
              const isCompleted = completedActions?.includes(action);
              return (
                <div key={index} className={cn(
                  "flex items-center justify-between p-2 rounded border-l-4",
                  isCompleted 
                    ? "bg-gray-100 text-gray-500 border-gray-400" 
                    : "bg-orange-50 border-orange-400"
                )}>
                  <span className={cn("text-sm", isCompleted && "line-through")}>
                    {action}
                  </span>
                  <div className="flex gap-1">
                    {isEditMode && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onRemovePendingAction(index)}
                      >
                        Remover
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCompleteAction(process.id, action)}
                    >
                      {isCompleted ? 'Reativar' : 'Dar Baixa'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {isEditMode && (
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Nova providência..."
                  value={newPendingAction}
                  onChange={(e) => onNewPendingActionChange(e.target.value)}
                  onKeyPress={onKeyPress}
                />
                <Button onClick={onAddPendingAction}>Adicionar</Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-center text-gray-500 py-4">
              Nenhuma providência pendente
            </p>
            {isEditMode && (
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Nova providência..."
                  value={newPendingAction}
                  onChange={(e) => onNewPendingActionChange(e.target.value)}
                  onKeyPress={onKeyPress}
                />
                <Button onClick={onAddPendingAction}>Adicionar</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingActionsCard;