import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessHistoryCardProps {
  processId: string;
  completedActions: string[];
}

const ProcessHistoryCard = ({ processId, completedActions }: ProcessHistoryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Providências</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(completedActions || []).length > 0 ? (
            completedActions.map((actionText, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium">{actionText}</p>
                  <p className="text-sm text-gray-600">
                    Concluída
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Nenhuma providência foi concluída ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessHistoryCard;