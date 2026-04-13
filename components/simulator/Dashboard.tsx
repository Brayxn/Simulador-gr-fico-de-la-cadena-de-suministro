'use client';

/**
 * ============================================
 * COMPONENTE DASHBOARD
 * ============================================
 * 
 * Panel lateral con información de la simulación.
 * Muestra métricas en tiempo real, controles y estadísticas.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraphNode, 
  GraphEdge, 
  Truck, 
  CalculatedRoute, 
  SimulationStats,
  SimulationState,
  NODE_CONFIG
} from '@/lib/graph-types';
import { WeightType } from '@/lib/dijkstra';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Truck as TruckIcon,
  Package,
  Clock,
  DollarSign,
  MapPin,
  Route,
  Zap,
  BookOpen,
  ChevronRight,
  Settings2,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truck: Truck;
  calculatedRoute: CalculatedRoute | null;
  stats: SimulationStats;
  simulationState: SimulationState;
  selectedNode: GraphNode | null;
  sourceNode: string;
  targetNode: string;
  weightType: WeightType;
  onSourceChange: (nodeId: string) => void;
  onTargetChange: (nodeId: string) => void;
  onWeightTypeChange: (type: WeightType) => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  onToggleExplanationMode: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function Dashboard({
  nodes,
  edges,
  truck,
  calculatedRoute,
  stats,
  simulationState,
  selectedNode,
  sourceNode,
  targetNode,
  weightType,
  onSourceChange,
  onTargetChange,
  onWeightTypeChange,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation,
  onToggleExplanationMode,
  onSpeedChange
}: DashboardProps) {
  const currentNode = nodes.find(n => n.id === truck.currentNodeId);
  const targetNodeObj = truck.targetNodeId ? nodes.find(n => n.id === truck.targetNodeId) : null;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4 bg-card/50 border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Panel de Control</h2>
          <p className="text-sm text-muted-foreground">Simulador de Cadena de Suministro</p>
        </div>
        <Badge 
          variant={simulationState.isRunning ? 'default' : simulationState.isPaused ? 'outline' : 'secondary'}
          className={
            simulationState.isRunning 
              ? 'bg-primary text-primary-foreground animate-pulse' 
              : simulationState.isPaused 
                ? 'border-chart-4 text-chart-4' 
                : ''
          }
        >
          {simulationState.isRunning ? 'En ejecucion' : simulationState.isPaused ? 'Pausado' : 'Listo'}
        </Badge>
      </div>

      {/* Controles de simulación */}
      <Card className="border-border bg-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Controles de Simulación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botones principales */}
          <div className="flex gap-2">
            {/* Botón de Iniciar - solo visible cuando NO hay simulación activa */}
            {!simulationState.isRunning && !simulationState.isPaused && (
              <Button
                onClick={onStartSimulation}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!calculatedRoute}
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Simulación
              </Button>
            )}
            
            {/* Botón de Pausar - solo visible cuando está corriendo */}
            {simulationState.isRunning && (
              <Button
                onClick={onPauseSimulation}
                className="flex-1 bg-chart-4 hover:bg-chart-4/90"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
            )}
            
            {/* Botón de Reanudar - solo visible cuando está pausado */}
            {simulationState.isPaused && !simulationState.isRunning && (
              <Button
                onClick={onPauseSimulation}
                className="flex-1 bg-chart-3 hover:bg-chart-3/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Reanudar
              </Button>
            )}
            
            <Button
              onClick={onResetSimulation}
              variant="outline"
              className="border-border"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Control de velocidad */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Velocidad de simulación</label>
            <div className="flex gap-1">
              {[0.5, 1, 2, 3].map((speed) => (
                <Button
                  key={speed}
                  variant={simulationState.speed === speed ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSpeedChange(speed)}
                  className={`flex-1 text-xs ${
                    simulationState.speed === speed 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border'
                  }`}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Modo explicación */}
          <Button
            onClick={onToggleExplanationMode}
            variant={simulationState.mode === 'explanation' ? 'default' : 'outline'}
            className={`w-full ${
              simulationState.mode === 'explanation' 
                ? 'bg-accent text-accent-foreground' 
                : 'border-border'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Modo Explicación
          </Button>
        </CardContent>
      </Card>

      {/* Configuración de ruta */}
      <Card className="border-border bg-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            Configuración de Ruta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de origen */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Nodo Origen</label>
            <select
              value={sourceNode}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full p-2 rounded-md bg-input border border-border text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {nodes.filter(n => n.type === 'factory' || n.type === 'warehouse').map((node) => (
                <option key={node.id} value={node.id}>
                  {NODE_CONFIG[node.type].icon} {node.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de destino */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Nodo Destino</label>
            <select
              value={targetNode}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full p-2 rounded-md bg-input border border-border text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {nodes.filter(n => n.type === 'store').map((node) => (
                <option key={node.id} value={node.id}>
                  {NODE_CONFIG[node.type].icon} {node.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de criterio de optimización */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Optimizar por</label>
            <div className="flex gap-1">
              {(['distance', 'cost', 'time'] as WeightType[]).map((type) => (
                <Button
                  key={type}
                  variant={weightType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onWeightTypeChange(type)}
                  className={`flex-1 text-xs ${
                    weightType === type 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border'
                  }`}
                >
                  {type === 'distance' ? 'Distancia' : type === 'cost' ? 'Costo' : 'Tiempo'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de ruta calculada */}
      {calculatedRoute && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Zap className="w-4 h-4" />
              Ruta Óptima (Dijkstra)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Visualización de la ruta */}
            <div className="flex items-center gap-1 flex-wrap">
              {calculatedRoute.path.map((nodeId, index) => {
                const node = nodes.find(n => n.id === nodeId);
                if (!node) return null;
                return (
                  <motion.div
                    key={nodeId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <Badge 
                      variant="outline" 
                      className="border-primary/50 text-xs"
                      style={{ borderColor: NODE_CONFIG[node.type].color }}
                    >
                      {NODE_CONFIG[node.type].icon} {node.name.split(' ')[0]}
                    </Badge>
                    {index < calculatedRoute.path.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Métricas de la ruta */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <MapPin className="w-4 h-4 mx-auto mb-1 text-chart-1" />
                <div className="text-lg font-bold text-foreground">{calculatedRoute.totalDistance}</div>
                <div className="text-[10px] text-muted-foreground">km</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-chart-2" />
                <div className="text-lg font-bold text-foreground">${calculatedRoute.totalCost}</div>
                <div className="text-[10px] text-muted-foreground">costo</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-chart-3" />
                <div className="text-lg font-bold text-foreground">{calculatedRoute.totalTime}</div>
                <div className="text-[10px] text-muted-foreground">min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado del camión */}
      <Card className="border-border bg-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-primary" />
            Estado del Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ubicación actual:</span>
            <Badge variant="outline" className="text-xs">
              {currentNode ? `${NODE_CONFIG[currentNode.type].icon} ${currentNode.name}` : 'N/A'}
            </Badge>
          </div>
          
          {targetNodeObj && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Destino:</span>
              <Badge variant="outline" className="text-xs border-primary/50">
                {NODE_CONFIG[targetNodeObj.type].icon} {targetNodeObj.name}
              </Badge>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Carga:</span>
              <span className="text-foreground font-mono">{truck.cargo}/{truck.maxCargo}</span>
            </div>
            <Progress value={(truck.cargo / truck.maxCargo) * 100} className="h-2" />
          </div>

          {truck.isMoving && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progreso del viaje:</span>
                <span className="text-foreground font-mono">{Math.round(truck.progress * 100)}%</span>
              </div>
              <Progress value={truck.progress * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas en tiempo real */}
      <Card className="border-border bg-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Estadísticas en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <Package className="w-4 h-4 mb-2 text-chart-1" />
              <div className="text-2xl font-bold text-foreground">{stats.totalTransported}</div>
              <div className="text-[10px] text-muted-foreground">Unidades transportadas</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <DollarSign className="w-4 h-4 mb-2 text-chart-2" />
              <div className="text-2xl font-bold text-foreground">${stats.totalCost}</div>
              <div className="text-[10px] text-muted-foreground">Costo total</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <MapPin className="w-4 h-4 mb-2 text-chart-3" />
              <div className="text-2xl font-bold text-foreground">{stats.totalDistance}</div>
              <div className="text-[10px] text-muted-foreground">km recorridos</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <Zap className="w-4 h-4 mb-2 text-chart-4" />
              <div className="text-2xl font-bold text-foreground">{stats.efficiency.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">Eficiencia</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
            <span className="text-muted-foreground">Entregas completadas:</span>
            <span className="text-foreground font-bold">{stats.deliveriesCompleted}</span>
          </div>
        </CardContent>
      </Card>

      {/* Información del nodo seleccionado */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-xl">{NODE_CONFIG[selectedNode.type].icon}</span>
                  {selectedNode.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {NODE_CONFIG[selectedNode.type].description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tipo:</span>
                    <Badge variant="outline">{NODE_CONFIG[selectedNode.type].label}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge 
                      variant={selectedNode.status === 'critical' ? 'destructive' : 
                              selectedNode.status === 'warning' ? 'default' : 'secondary'}
                    >
                      {selectedNode.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Inventario:</span>
                      <span className="text-foreground font-mono">
                        {selectedNode.inventory.current}/{selectedNode.inventory.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={(selectedNode.inventory.current / selectedNode.inventory.capacity) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
