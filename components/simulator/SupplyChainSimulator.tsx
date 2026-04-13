'use client';

/**
 * ============================================
 * COMPONENTE PRINCIPAL: SUPPLY CHAIN SIMULATOR
 * ============================================
 * 
 * Componente principal que integra todos los elementos
 * del simulador de cadena de suministro.
 * 
 * CARACTERÍSTICAS:
 * - Visualización interactiva del grafo logístico
 * - Animación de transporte entre nodos
 * - Algoritmo de Dijkstra para ruta óptima
 * - Panel de control con métricas en tiempo real
 * - Modo explicación educativa
 * - Gráficos de estadísticas
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/hooks/use-simulation';
import GraphCanvas from './GraphCanvas';
import Dashboard from './Dashboard';
import ExplanationPanel from './ExplanationPanel';
import StatsChart from './StatsChart';
import { EXPLANATION_STEPS } from '@/lib/graph-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network, 
  Maximize2, 
  Minimize2,
  Info,
  Github
} from 'lucide-react';

export default function SupplyChainSimulator() {
  const {
    nodes,
    edges,
    truck,
    calculatedRoute,
    stats,
    simulationState,
    selectedNode,
    highlightedNodes,
    highlightedEdges,
    sourceNode,
    targetNode,
    weightType,
    setSourceNode,
    setTargetNode,
    setWeightType,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSpeed,
    toggleExplanationMode,
    handleNodeClick,
    setHighlightedNodes,
    setHighlightedEdges,
    setSimulationState
  } = useSimulation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentExplanationStep, setCurrentExplanationStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Refs para mantener las funciones estables
  const setHighlightedNodesRef = useRef(setHighlightedNodes);
  const setHighlightedEdgesRef = useRef(setHighlightedEdges);
  
  // Actualizar refs cuando cambien las funciones
  useEffect(() => {
    setHighlightedNodesRef.current = setHighlightedNodes;
    setHighlightedEdgesRef.current = setHighlightedEdges;
  });

  // Manejo del modo explicacion
  useEffect(() => {
    if (simulationState.mode === 'explanation') {
      const step = EXPLANATION_STEPS[currentExplanationStep];
      if (step) {
        setHighlightedNodesRef.current(step.highlightNodes);
        setHighlightedEdgesRef.current(step.highlightEdges);
      }
    } else {
      setHighlightedNodesRef.current([]);
      setHighlightedEdgesRef.current([]);
    }
  }, [simulationState.mode, currentExplanationStep]);

  // Navegación de explicación
  const handleNextExplanationStep = () => {
    if (currentExplanationStep < EXPLANATION_STEPS.length - 1) {
      setCurrentExplanationStep(prev => prev + 1);
    }
  };

  const handlePrevExplanationStep = () => {
    if (currentExplanationStep > 0) {
      setCurrentExplanationStep(prev => prev - 1);
    }
  };

  const handleCloseExplanation = () => {
    toggleExplanationMode();
    setCurrentExplanationStep(0);
  };

  // Toggle fullscreen — usa la Fullscreen API del navegador
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Sincronizar estado si el usuario sale con Escape
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-background text-foreground ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Simulador Gráfico de la Cadena de Suministro
              </h1>
              <p className="text-xs text-muted-foreground">
                Simulador de Cadena de Suministro con Teoría de Grafos
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex text-[10px] border-primary/50 text-primary">
            Proyecto de Ingeniería de Sistemas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(prev => !prev)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <a href="https://github.com/Brayxn/Simulador-gr-fico-de-la-cadena-de-suministro" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </header>

      {/* Panel de información o Explicación */}
      <AnimatePresence mode="wait">
        {simulationState.mode === 'explanation' ? (
          <ExplanationPanel
            key="explanation-panel"
            steps={EXPLANATION_STEPS}
            currentStep={currentExplanationStep}
            onNextStep={handleNextExplanationStep}
            onPrevStep={handlePrevExplanationStep}
            onClose={handleCloseExplanation}
            isAnimating={simulationState.isRunning}
          />
        ) : showInfo ? (
          <motion.div
            key="info-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-accent/10 border-b border-border"
          >
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Teoría de Grafos</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Un grafo es una estructura matemática que modela relaciones entre objetos. 
                  En logística, los nodos representan ubicaciones y las aristas representan rutas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Algoritmo de Dijkstra</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Algoritmo que encuentra la ruta más corta entre dos nodos en un grafo ponderado.
                  Complejidad: O((V + E) log V) donde V son vértices y E son aristas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Aplicación Real</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Empresas como Amazon, FedEx y UPS utilizan algoritmos similares para optimizar
                  millones de entregas diarias, reduciendo costos y tiempos.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Área del grafo */}
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          {/* Canvas del grafo */}
          <div className="flex-1 relative min-h-[300px]">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              truck={truck}
              calculatedRoute={calculatedRoute}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              explanationMode={simulationState.mode === 'explanation'}
            />
          </div>

          {/* Gráficos de estadísticas */}
          <div className="h-[200px] shrink-0">
            <StatsChart
              stats={stats}
              nodes={nodes}
              isRunning={simulationState.isRunning}
            />
          </div>
        </div>

        {/* Panel lateral (Dashboard) */}
        <div className="w-[380px] shrink-0 overflow-y-auto border-l border-border hidden lg:block">
          <Dashboard
            nodes={nodes}
            edges={edges}
            truck={truck}
            calculatedRoute={calculatedRoute}
            stats={stats}
            simulationState={simulationState}
            selectedNode={selectedNode}
            sourceNode={sourceNode}
            targetNode={targetNode}
            weightType={weightType}
            onSourceChange={setSourceNode}
            onTargetChange={setTargetNode}
            onWeightTypeChange={setWeightType}
            onStartSimulation={startSimulation}
            onPauseSimulation={pauseSimulation}
            onResetSimulation={resetSimulation}
            onToggleExplanationMode={toggleExplanationMode}
            onSpeedChange={setSpeed}
          />
        </div>
      </div>

      {/* Footer móvil con controles */}
      <div className="lg:hidden border-t border-border bg-card/50 p-4">
        <div className="flex gap-2 justify-center">
          <Button
            onClick={simulationState.isRunning ? pauseSimulation : startSimulation}
            className="flex-1 max-w-[200px] bg-primary"
            disabled={!calculatedRoute}
          >
            {simulationState.isRunning ? 'Pausar' : 'Iniciar Simulación'}
          </Button>
          <Button
            onClick={resetSimulation}
            variant="outline"
          >
            Reiniciar
          </Button>
          <Button
            onClick={toggleExplanationMode}
            variant={simulationState.mode === 'explanation' ? 'default' : 'outline'}
            className={simulationState.mode === 'explanation' ? 'bg-accent' : ''}
          >
            Explicar
          </Button>
        </div>
      </div>

      {/* Indicador de estado en móvil */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4">
        <AnimatePresence>
          {simulationState.isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-primary/50 shadow-lg"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transportando...</span>
                <span className="text-primary font-mono">
                  {truck.cargo} unidades | {Math.round(truck.progress * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
