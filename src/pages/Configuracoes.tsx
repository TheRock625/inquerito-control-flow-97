
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Home, GripVertical } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const Configuracoes = () => {
  const {
    origins,
    statuses,
    forwardings,
    addOrigin,
    addStatus,
    addForwarding,
    removeOrigin,
    removeStatus,
    removeForwarding,
    reorderOrigins,
    reorderStatuses,
    reorderForwardings
  } = useConfig();

  const [newOrigin, setNewOrigin] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newForwarding, setNewForwarding] = useState('');

  const handleAddOrigin = () => {
    if (newOrigin.trim()) {
      addOrigin(newOrigin.trim());
      setNewOrigin('');
    }
  };

  const handleAddStatus = () => {
    if (newStatus.trim()) {
      addStatus(newStatus.trim());
      setNewStatus('');
    }
  };

  const handleAddForwarding = () => {
    if (newForwarding.trim()) {
      addForwarding(newForwarding.trim());
      setNewForwarding('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.index === destination.index) return;

    if (source.droppableId === 'origins') {
      reorderOrigins(source.index, destination.index);
    } else if (source.droppableId === 'statuses') {
      reorderStatuses(source.index, destination.index);
    } else if (source.droppableId === 'forwardings') {
      reorderForwardings(source.index, destination.index);
    }
  };

  const renderDraggableItems = (items: string[], type: 'origins' | 'statuses' | 'forwardings', removeHandler: (item: string) => void) => (
    <Droppable droppableId={type}>
      {(provided) => (
        <div 
          {...provided.droppableProps} 
          ref={provided.innerRef}
          className="space-y-2"
        >
          {items.map((item, index) => (
            <Draggable key={item} draggableId={`${type}-${item}`} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`flex items-center gap-2 ${
                    snapshot.isDragging ? 'bg-blue-50 shadow-lg rounded-lg' : ''
                  }`}
                >
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-2 flex-1">
                    {item}
                    <button
                      onClick={() => removeHandler(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie origens, status e encaminhamentos do sistema</p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Tabs defaultValue="origins" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="origins">Origens</TabsTrigger>
            <TabsTrigger value="statuses">Status</TabsTrigger>
            <TabsTrigger value="forwardings">Encaminhamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="origins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Origens (DPs)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newOrigin">Nova Origem</Label>
                    <Input
                      id="newOrigin"
                      placeholder="Ex: 36ª DP"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddOrigin)}
                    />
                  </div>
                  <Button onClick={handleAddOrigin} className="mt-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Origens Cadastradas (arraste para reordenar)</Label>
                  {renderDraggableItems(origins, 'origins', removeOrigin)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statuses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newStatus">Novo Status</Label>
                    <Input
                      id="newStatus"
                      placeholder="Ex: Aguardando Documentos"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddStatus)}
                    />
                  </div>
                  <Button onClick={handleAddStatus} className="mt-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Status Cadastrados (arraste para reordenar)</Label>
                  {renderDraggableItems(statuses, 'statuses', removeStatus)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forwardings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Encaminhamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newForwarding">Novo Encaminhamento</Label>
                    <Input
                      id="newForwarding"
                      placeholder="Ex: Delta 04"
                      value={newForwarding}
                      onChange={(e) => setNewForwarding(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleAddForwarding)}
                    />
                  </div>
                  <Button onClick={handleAddForwarding} className="mt-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Encaminhamentos Cadastrados (arraste para reordenar)</Label>
                  {renderDraggableItems(forwardings, 'forwardings', removeForwarding)}
                </div>
              </CardContent>  
            </Card>
          </TabsContent>
        </Tabs>
      </DragDropContext>
    </div>
  );
};

export default Configuracoes;
