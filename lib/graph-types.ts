/**
 * ============================================
 * TIPOS DE DATOS PARA EL GRAFO LOGÍSTICO
 * ============================================
 * 
 * Este archivo define las estructuras de datos fundamentales
 * para representar la red logística como un grafo dirigido.
 * 
 * CONCEPTOS DE TEORÍA DE GRAFOS:
 * - Nodo (Vértice): Representa una ubicación en la red logística
 * - Arista (Edge): Representa una ruta entre dos ubicaciones
 * - Grafo Dirigido: Las rutas tienen dirección (origen → destino)
 */

// Tipos de nodos en la red logística
export type NodeType = 'factory' | 'warehouse' | 'distribution' | 'store';

// Configuración visual de cada tipo de nodo
export const NODE_CONFIG: Record<NodeType, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  factory: {
    label: 'Fábrica',
    icon: '🏭',
    color: 'var(--factory)',
    description: 'Punto de origen de la mercancía. Produce y envía productos.'
  },
  warehouse: {
    label: 'Almacén',
    icon: '📦',
    color: 'var(--warehouse)',
    description: 'Centro de almacenamiento. Recibe y almacena productos temporalmente.'
  },
  distribution: {
    label: 'Centro de Distribución',
    icon: '🚛',
    color: 'var(--distribution)',
    description: 'Punto de redistribución. Organiza y envía a múltiples destinos.'
  },
  store: {
    label: 'Tienda',
    icon: '🏪',
    color: 'var(--store)',
    description: 'Punto de venta final. Recibe productos para consumidores.'
  }
};

/**
 * NODO DEL GRAFO
 * Representa una ubicación física en la cadena de suministro
 */
export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;  // Posición X en el canvas
  y: number;  // Posición Y en el canvas
  inventory: {
    current: number;    // Inventario actual
    capacity: number;   // Capacidad máxima
  };
  status: 'active' | 'inactive' | 'warning' | 'critical';
}

/**
 * ARISTA DEL GRAFO
 * Representa una ruta logística entre dos nodos
 * 
 * En teoría de grafos, una arista conecta dos vértices.
 * En nuestro caso, representa una ruta de transporte con métricas.
 */
export interface GraphEdge {
  id: string;
  source: string;      // ID del nodo origen
  target: string;      // ID del nodo destino
  distance: number;    // Distancia en km
  cost: number;        // Costo de transporte en $
  time: number;        // Tiempo de transporte en minutos
  isActive: boolean;   // Si la ruta está siendo usada
}

/**
 * GRAFO COMPLETO
 * Estructura de datos que contiene todos los nodos y aristas
 */
export interface SupplyChainGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * CAMIÓN DE TRANSPORTE
 * Representa el vehículo que se mueve entre nodos
 */
export interface Truck {
  id: string;
  currentNodeId: string;
  targetNodeId: string | null;
  cargo: number;          // Cantidad de mercancía transportada
  maxCargo: number;       // Capacidad máxima del camión
  progress: number;       // Progreso del viaje (0-1) dentro del segmento actual
  isMoving: boolean;
  speed: number;          // Velocidad de animación
  routeIndex: number;     // Índice del segmento actual en calculatedRoute.path
}

/**
 * RUTA CALCULADA
 * Resultado del algoritmo de Dijkstra
 */
export interface CalculatedRoute {
  path: string[];           // IDs de nodos en orden
  totalDistance: number;    // Distancia total
  totalCost: number;        // Costo total
  totalTime: number;        // Tiempo total en minutos
  edges: GraphEdge[];       // Aristas que forman la ruta
}

/**
 * ESTADÍSTICAS DE SIMULACIÓN
 * Métricas en tiempo real de la simulación
 */
export interface SimulationStats {
  totalTransported: number;     // Total de mercancía transportada
  totalCost: number;            // Costo acumulado
  totalDistance: number;        // Distancia total recorrida
  totalTime: number;            // Tiempo total
  deliveriesCompleted: number;  // Número de entregas completadas
  efficiency: number;           // Eficiencia logística (0-100)
}

/**
 * ESTADO DE LA SIMULACIÓN
 * Control general del simulador
 */
export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;              // Multiplicador de velocidad (1x, 2x, etc.)
  currentStep: number;        // Paso actual de la simulación
  mode: 'normal' | 'explanation';  // Modo de visualización
}

/**
 * PASO DE EXPLICACIÓN
 * Para el modo demostración educativa
 */
export interface ExplanationStep {
  id: number;
  title: string;
  description: string;
  highlightNodes: string[];
  highlightEdges: string[];
  action: 'highlight' | 'animate' | 'calculate' | 'complete';
}
