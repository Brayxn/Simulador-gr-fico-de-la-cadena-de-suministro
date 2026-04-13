'use client';

/**
 * ============================================
 * HOOK USE-SIMULATION
 * ============================================
 *
 * Hook personalizado que maneja toda la lógica de la simulación.
 * Incluye el estado del grafo, camión, animaciones y algoritmos.
 *
 * ── NOTA SOBRE STRICT MODE ──────────────────
 * React Strict Mode (activo en Next.js dev) invoca los "functional updaters"
 * (las funciones que se pasan a setState) DOS veces para detectar efectos
 * secundarios. Si mutamos una ref DENTRO de un functional updater, esa mutación
 * ocurre DOBLE, lo que provoca que el camión salte nodos intermedios.
 *
 * Solución aplicada:
 *   - Se usa `truckRef` (un ref mutable) para leer/escribir el estado del camión
 *     DIRECTAMENTE dentro del loop requestAnimationFrame, FUERA de cualquier
 *     functional updater.
 *   - `setTruck(newState)` se llama con el OBJETO COMPLETO (no con un updater
 *     funcional), sólo para disparar el re-render de React.
 *   - `routeIndex` viaja como campo dentro del objeto del camión (no en un ref
 *     separado), eliminando completamente la posibilidad de doble-mutación.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  GraphNode,
  GraphEdge,
  Truck,
  CalculatedRoute,
  SimulationStats,
  SimulationState
} from '@/lib/graph-types';
import { INITIAL_NODES, INITIAL_EDGES, SIMULATION_CONFIG } from '@/lib/graph-data';
import { dijkstra, WeightType } from '@/lib/dijkstra';

// ─── Estado inicial del camión ───────────────────────────────────────────────
const INITIAL_TRUCK: Truck = {
  id: 'truck-1',
  currentNodeId: 'factory-1',
  targetNodeId: null,
  cargo: 0,
  maxCargo: SIMULATION_CONFIG.truckCapacity,
  progress: 0,
  isMoving: false,
  speed: SIMULATION_CONFIG.baseSpeed,
  routeIndex: 0
};

export function useSimulation() {
  // ── Estado del grafo ────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);

  // ── Estado de la simulación ─────────────────────────────────────────────────
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    speed: 1,
    currentStep: 0,
    mode: 'normal'
  });

  // ── Estado del camión (React state → renderiza el SVG) ──────────────────────
  const [truck, setTruck] = useState<Truck>(INITIAL_TRUCK);

  /**
   * truckRef: ref mutable que SIEMPRE contiene el estado actual del camión.
   * Se actualiza SINCRÓNICAMENTE dentro del loop requestAnimationFrame,
   * ANTES de llamar a setTruck. Esto evita lecturas de estado obsoleto
   * (stale closures) y el bug de doble-mutación de Strict Mode.
   */
  const truckRef = useRef<Truck>(INITIAL_TRUCK);

  // ── Configuración de ruta ───────────────────────────────────────────────────
  const [sourceNode, setSourceNode] = useState<string>('factory-1');
  const [targetNode, setTargetNode] = useState<string>('store-3');
  const [weightType, setWeightType] = useState<WeightType>('distance');

  // ── Ruta calculada (memoizada para evitar recálculos innecesarios) ──────────
  const calculatedRoute = useMemo<CalculatedRoute | null>(() => {
    return dijkstra(INITIAL_NODES, INITIAL_EDGES, sourceNode, targetNode, weightType);
  }, [sourceNode, targetNode, weightType]);

  // Actualizar aristas activas cuando cambia la ruta calculada
  useEffect(() => {
    if (calculatedRoute) {
      setEdges(INITIAL_EDGES.map(edge => ({
        ...edge,
        isActive: calculatedRoute.edges.some(e => e.id === edge.id)
      })));
    } else {
      setEdges(INITIAL_EDGES.map(e => ({ ...e, isActive: false })));
    }
  }, [calculatedRoute]);

  // ── Estadísticas ────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<SimulationStats>({
    totalTransported: 0,
    totalCost: 0,
    totalDistance: 0,
    totalTime: 0,
    deliveriesCompleted: 0,
    efficiency: 0
  });

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

  // Referencia al requestAnimationFrame activo
  const animationRef = useRef<number | null>(null);

  // ── Iniciar simulación ──────────────────────────────────────────────────────
  const startSimulation = useCallback(() => {
    if (!calculatedRoute || calculatedRoute.path.length < 2) return;

    // Calcular mercancía a cargar desde el nodo origen
    const sourceNodeObj = nodes.find(n => n.id === sourceNode);
    const cargoAmount = Math.min(
      SIMULATION_CONFIG.cargoPerDelivery,
      sourceNodeObj?.inventory.current || 0,
      SIMULATION_CONFIG.truckCapacity
    );

    // Descontar mercancía del nodo origen
    setNodes(prev => prev.map(node => {
      if (node.id === sourceNode) {
        return {
          ...node,
          inventory: {
            ...node.inventory,
            current: node.inventory.current - cargoAmount
          }
        };
      }
      return node;
    }));

    // Configurar camión para el primer segmento: path[0] → path[1]
    const newTruck: Truck = {
      id: 'truck-1',
      currentNodeId: calculatedRoute.path[0],
      targetNodeId: calculatedRoute.path[1],
      cargo: cargoAmount,
      maxCargo: SIMULATION_CONFIG.truckCapacity,
      progress: 0,
      isMoving: true,
      speed: SIMULATION_CONFIG.baseSpeed,
      routeIndex: 0  // segmento 0: path[0] → path[1]
    };

    // Actualizar ref y estado React a la vez (el ref aplica inmediatamente)
    truckRef.current = newTruck;
    setTruck(newTruck);

    setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));
  }, [calculatedRoute, nodes, sourceNode]);

  // ── Pausar simulación ───────────────────────────────────────────────────────
  const pauseSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  }, []);

  // ── Reanudar simulación ─────────────────────────────────────────────────────
  const resumeSimulation = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));
  }, []);

  // ── Resetear simulación ─────────────────────────────────────────────────────
  const resetSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setNodes(INITIAL_NODES);

    truckRef.current = INITIAL_TRUCK;
    setTruck(INITIAL_TRUCK);

    setStats({
      totalTransported: 0,
      totalCost: 0,
      totalDistance: 0,
      totalTime: 0,
      deliveriesCompleted: 0,
      efficiency: 0
    });
    setSimulationState({
      isRunning: false,
      isPaused: false,
      speed: 1,
      currentStep: 0,
      mode: 'normal'
    });
    setHighlightedNodes([]);
    setHighlightedEdges([]);

    const route = dijkstra(INITIAL_NODES, INITIAL_EDGES, sourceNode, targetNode, weightType);
    if (route) {
      setEdges(INITIAL_EDGES.map(edge => ({
        ...edge,
        isActive: route.edges.some(e => e.id === edge.id)
      })));
    } else {
      setEdges(INITIAL_EDGES.map(e => ({ ...e, isActive: false })));
    }
  }, [sourceNode, targetNode, weightType]);

  // ── Cambiar velocidad ───────────────────────────────────────────────────────
  const setSpeed = useCallback((speed: number) => {
    setSimulationState(prev => ({ ...prev, speed }));
  }, []);

  // ── Alternar modo explicación ───────────────────────────────────────────────
  const toggleExplanationMode = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      mode: prev.mode === 'explanation' ? 'normal' : 'explanation',
      currentStep: 0
    }));
  }, []);

  /**
   * ════════════════════════════════════════════════════════════════════════════
   * LOOP DE ANIMACIÓN
   * ════════════════════════════════════════════════════════════════════════════
   *
   * Lee SIEMPRE desde `truckRef.current` (nunca desde el closure de React state)
   * para garantizar que:
   *   1. Los valores sean los más recientes (sin stale closures).
   *   2. La mutación del índice de ruta ocurra UNA SOLA VEZ por frame,
   *      independientemente del comportamiento de Strict Mode.
   *
   * LÓGICA DE SEGMENTOS
   * ───────────────────
   * La ruta calculada tiene N nodos y N-1 aristas (segmentos):
   *   Segmento 0 : path[0] → path[1]   (routeIndex = 0)
   *   Segmento 1 : path[1] → path[2]   (routeIndex = 1)
   *   ...
   *   Segmento N-2: path[N-2] → path[N-1]  (routeIndex = N-2)
   *
   * Al llegar al final del segmento `routeIndex = i`:
   *   - arrivedNodeId   = path[i+1]         (nodo al que se llegó)
   *   - nextRouteIndex  = i+1               (índice del NUEVO segmento)
   *   - targetNodeId    = path[i+2]         (próximo destino)
   *   - Condición para continuar: i+2 < N  (hay un nodo más adelante)
   */
  useEffect(() => {
    if (!simulationState.isRunning || !calculatedRoute) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // ── Leer estado actual del camión desde el ref (nunca desde closure) ──
      const cur = truckRef.current;

      if (!cur.isMoving) return; // simulación terminada

      const progressIncrement = (deltaTime / 1000) * 0.5 * simulationState.speed;
      const newProgress = cur.progress + progressIncrement;

      // ── El camión llegó al final del segmento actual ──────────────────────
      if (newProgress >= 1) {
        const arrivedNodeId = cur.targetNodeId!;
        const finalDestination = calculatedRoute.path[calculatedRoute.path.length - 1];
        const isAtFinalDestination = arrivedNodeId === finalDestination;

        // Contabilizar métricas del segmento recién completado
        const completedEdge = calculatedRoute.edges[cur.routeIndex];
        if (completedEdge) {
          setStats(prev => ({
            ...prev,
            totalDistance: prev.totalDistance + completedEdge.distance,
            totalCost: prev.totalCost + completedEdge.cost,
            totalTime: prev.totalTime + completedEdge.time
          }));
        }

        // ── DESTINO FINAL: entregar toda la carga ─────────────────────────
        if (isAtFinalDestination) {
          const deliveredCargo = cur.cargo;

          // Aumentar inventario de la tienda destino
          setNodes(prev => prev.map(node => {
            if (node.id === arrivedNodeId) {
              const newCurrent = Math.min(
                node.inventory.current + deliveredCargo,
                node.inventory.capacity
              );
              return {
                ...node,
                inventory: { ...node.inventory, current: newCurrent },
                status: newCurrent < node.inventory.capacity * 0.2 ? 'critical' :
                        newCurrent < node.inventory.capacity * 0.5 ? 'warning' : 'active'
              };
            }
            return node;
          }));

          // Estadísticas finales de la entrega
          setStats(prev => ({
            ...prev,
            totalTransported: prev.totalTransported + deliveredCargo,
            deliveriesCompleted: prev.deliveriesCompleted + 1,
            efficiency: Math.min(
              100,
              ((prev.deliveriesCompleted + 1) / (prev.totalCost / 100 + 1)) * 50
            )
          }));

          // Detener camión
          const finishedTruck: Truck = {
            ...cur,
            currentNodeId: arrivedNodeId,
            targetNodeId: null,
            cargo: 0,
            progress: 0,
            isMoving: false
          };
          truckRef.current = finishedTruck;
          setTruck(finishedTruck);

          setSimulationState(prev => ({
            ...prev,
            isRunning: false,
            isPaused: false
          }));

          return; // Fin del loop de animación
        }

        // ── NODO INTERMEDIO: modelo "Break-Bulk" / Relay logístico ────────
        //
        // Cada nodo intermedio actúa como receptor Y emisor:
        //
        //   Almacén     : recibe cur.cargo (50), retiene 20, reenvía 30
        //   Distribución: recibe 30,             retiene 10, reenvía 20
        //   Tienda      : recibe lo que queda (caso final, ya tratado arriba)
        //
        // Flujo de inventario:
        //   nodo.inventory += keepAmount   (el nodo guarda su parte)
        //   truck.cargo    -= keepAmount   (el camión sigue con el resto)
        //
        // Esto hace que el ticker del camión BAJE en cada parada,
        // demostrando visualmente el flujo logístico correcto.

        const nextRouteIndex = cur.routeIndex + 1;

        if (nextRouteIndex + 1 <= calculatedRoute.path.length - 1) {
          // Determinar cuánto retiene este nodo según su tipo
          const arrivedNodeDef = INITIAL_NODES.find(n => n.id === arrivedNodeId);
          let keepAmount = 0;
          if (arrivedNodeDef?.type === 'warehouse') {
            keepAmount = Math.min(SIMULATION_CONFIG.nodeKeep.warehouse, cur.cargo);
          } else if (arrivedNodeDef?.type === 'distribution') {
            keepAmount = Math.min(SIMULATION_CONFIG.nodeKeep.distribution, cur.cargo);
          }
          const forwardAmount = Math.max(0, cur.cargo - keepAmount);

          // Actualizar inventario del nodo: recibe keepAmount de stock
          if (keepAmount > 0) {
            setNodes(prev => prev.map(node => {
              if (node.id === arrivedNodeId) {
                const newCurrent = Math.min(
                  node.inventory.current + keepAmount,
                  node.inventory.capacity
                );
                return {
                  ...node,
                  inventory: { ...node.inventory, current: newCurrent },
                  status: newCurrent < node.inventory.capacity * 0.2 ? 'critical' :
                          newCurrent < node.inventory.capacity * 0.5 ? 'warning' : 'active'
                };
              }
              return node;
            }));
          }

          // Avanzar al siguiente segmento con carga reducida
          const nextTruck: Truck = {
            ...cur,
            currentNodeId: arrivedNodeId,                            // nodo recién llegado
            targetNodeId: calculatedRoute.path[nextRouteIndex + 1], // próximo destino
            progress: 0,
            cargo: forwardAmount,  // carga reducida tras dejar stock en este nodo
            routeIndex: nextRouteIndex
          };
          truckRef.current = nextTruck; // escritura sincrónica, 1 sola vez (Strict-Mode safe)
          setTruck(nextTruck);          // dispara re-render de React
        }

      } else {
        // ── Avanzar progreso dentro del segmento actual ───────────────────
        const updatedTruck: Truck = { ...cur, progress: newProgress };
        truckRef.current = updatedTruck;
        setTruck(updatedTruck);
      }

      // Solicitar siguiente frame
      if (simulationState.isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.isRunning, simulationState.speed, calculatedRoute]);

  // ── Click en nodo ───────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  // ── Toggle pausa/reanudar ───────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (simulationState.isPaused) {
      resumeSimulation();
    } else {
      pauseSimulation();
    }
  }, [simulationState.isPaused, pauseSimulation, resumeSimulation]);

  // ── Highlight helpers ───────────────────────────────────────────────────────
  const updateHighlightedNodes = useCallback((nodes: string[]) => {
    setHighlightedNodes(nodes);
  }, []);

  const updateHighlightedEdges = useCallback((edges: string[]) => {
    setHighlightedEdges(edges);
  }, []);

  return {
    // Estado
    nodes,
    edges,
    truck,
    calculatedRoute,
    stats,
    simulationState,
    selectedNode,
    highlightedNodes,
    highlightedEdges,

    // Configuración
    sourceNode,
    targetNode,
    weightType,

    // Acciones
    setSourceNode,
    setTargetNode,
    setWeightType,
    startSimulation,
    pauseSimulation: togglePause,
    resetSimulation,
    setSpeed,
    toggleExplanationMode,
    handleNodeClick,
    setHighlightedNodes: updateHighlightedNodes,
    setHighlightedEdges: updateHighlightedEdges,
    setSimulationState
  };
}
