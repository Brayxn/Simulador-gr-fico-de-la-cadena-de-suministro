/**
 * ============================================
 * DATOS INICIALES DEL GRAFO LOGÍSTICO
 * ============================================
 * 
 * Este archivo contiene la configuración inicial de la red logística.
 * 
 * ESTRUCTURA DE LA RED:
 * - 1 Fábrica central (origen de producción)
 * - 2 Almacenes (puntos de almacenamiento)
 * - 2 Centros de distribución (hubs logísticos)
 * - 3 Tiendas (puntos de venta)
 * 
 * CÓMO MODIFICAR:
 * Para agregar un nuevo nodo:
 * 1. Añadir entrada en INITIAL_NODES con id único
 * 2. Definir posición x, y (coordenadas en el canvas)
 * 3. Especificar tipo, nombre e inventario inicial
 * 
 * Para agregar una nueva ruta:
 * 1. Añadir entrada en INITIAL_EDGES
 * 2. Especificar source (origen) y target (destino)
 * 3. Definir distancia, costo y tiempo
 */

import { GraphNode, GraphEdge, ExplanationStep } from './graph-types';

/**
 * NODOS INICIALES DE LA RED LOGÍSTICA
 * 
 * Posicionamiento:
 * - El canvas tiene 1000x600 unidades
 * - La fábrica está a la izquierda (origen)
 * - Las tiendas están a la derecha (destinos)
 */
export const INITIAL_NODES: GraphNode[] = [
  // FÁBRICA - Punto de origen
  {
    id: 'factory-1',
    type: 'factory',
    name: 'Fábrica Principal',
    x: 100,
    y: 250,
    inventory: {
      current: 1000,
      capacity: 2000
    },
    status: 'active'
  },
  
  // ALMACENES - Puntos de almacenamiento intermedio
  {
    id: 'warehouse-1',
    type: 'warehouse',
    name: 'Almacén Norte',
    x: 300,
    y: 100,
    inventory: {
      current: 300,
      capacity: 500
    },
    status: 'active'
  },
  {
    id: 'warehouse-2',
    type: 'warehouse',
    name: 'Almacén Sur',
    x: 300,
    y: 400,
    inventory: {
      current: 250,
      capacity: 500
    },
    status: 'active'
  },
  
  // CENTROS DE DISTRIBUCIÓN - Hubs logísticos
  {
    id: 'distribution-1',
    type: 'distribution',
    name: 'Centro Distribución A',
    x: 550,
    y: 150,
    inventory: {
      current: 150,
      capacity: 300
    },
    status: 'active'
  },
  {
    id: 'distribution-2',
    type: 'distribution',
    name: 'Centro Distribución B',
    x: 550,
    y: 350,
    inventory: {
      current: 120,
      capacity: 300
    },
    status: 'active'
  },
  
  // TIENDAS - Puntos de venta final
  {
    id: 'store-1',
    type: 'store',
    name: 'Tienda Centro',
    x: 800,
    y: 100,
    inventory: {
      current: 50,
      capacity: 100
    },
    status: 'active'
  },
  {
    id: 'store-2',
    type: 'store',
    name: 'Tienda Plaza',
    x: 800,
    y: 250,
    inventory: {
      current: 30,
      capacity: 100
    },
    status: 'warning'
  },
  {
    id: 'store-3',
    type: 'store',
    name: 'Tienda Sur',
    x: 800,
    y: 400,
    inventory: {
      current: 15,
      capacity: 100
    },
    status: 'critical'
  }
];

/**
 * ARISTAS (RUTAS) INICIALES
 * 
 * Cada arista representa una ruta logística con:
 * - distance: Kilómetros de recorrido
 * - cost: Costo en dólares del transporte
 * - time: Tiempo en minutos del trayecto
 * 
 * Las métricas están diseñadas para que el algoritmo
 * de Dijkstra encuentre diferentes rutas óptimas según
 * el criterio de optimización seleccionado.
 */
export const INITIAL_EDGES: GraphEdge[] = [
  // RUTAS DESDE LA FÁBRICA
  {
    id: 'edge-1',
    source: 'factory-1',
    target: 'warehouse-1',
    distance: 50,
    cost: 100,
    time: 45,
    isActive: false
  },
  {
    id: 'edge-2',
    source: 'factory-1',
    target: 'warehouse-2',
    distance: 60,
    cost: 80,
    time: 50,
    isActive: false
  },
  
  // RUTAS DESDE ALMACÉN NORTE
  {
    id: 'edge-3',
    source: 'warehouse-1',
    target: 'distribution-1',
    distance: 40,
    cost: 70,
    time: 35,
    isActive: false
  },
  {
    id: 'edge-4',
    source: 'warehouse-1',
    target: 'distribution-2',
    distance: 70,
    cost: 90,
    time: 60,
    isActive: false
  },
  
  // RUTAS DESDE ALMACÉN SUR
  {
    id: 'edge-5',
    source: 'warehouse-2',
    target: 'distribution-1',
    distance: 65,
    cost: 85,
    time: 55,
    isActive: false
  },
  {
    id: 'edge-6',
    source: 'warehouse-2',
    target: 'distribution-2',
    distance: 35,
    cost: 60,
    time: 30,
    isActive: false
  },
  
  // RUTAS DESDE CENTRO DE DISTRIBUCIÓN A
  {
    id: 'edge-7',
    source: 'distribution-1',
    target: 'store-1',
    distance: 30,
    cost: 50,
    time: 25,
    isActive: false
  },
  {
    id: 'edge-8',
    source: 'distribution-1',
    target: 'store-2',
    distance: 25,
    cost: 45,
    time: 20,
    isActive: false
  },
  
  // RUTAS DESDE CENTRO DE DISTRIBUCIÓN B
  {
    id: 'edge-9',
    source: 'distribution-2',
    target: 'store-2',
    distance: 28,
    cost: 48,
    time: 22,
    isActive: false
  },
  {
    id: 'edge-10',
    source: 'distribution-2',
    target: 'store-3',
    distance: 22,
    cost: 40,
    time: 18,
    isActive: false
  },
  
  // RUTAS ALTERNATIVAS DIRECTAS (para demostrar optimización)
  {
    id: 'edge-11',
    source: 'warehouse-1',
    target: 'store-1',
    distance: 120,
    cost: 200,
    time: 100,
    isActive: false
  },
  {
    id: 'edge-12',
    source: 'warehouse-2',
    target: 'store-3',
    distance: 110,
    cost: 180,
    time: 90,
    isActive: false
  }
];

/**
 * PASOS DE EXPLICACIÓN PARA MODO DEMOSTRACIÓN
 * 
 * Cada paso explica un concepto de teoría de grafos
 * mientras muestra visualmente la simulación.
 */
export const EXPLANATION_STEPS: ExplanationStep[] = [
  {
    id: 1,
    title: '¿Qué es un Grafo?',
    description: 'Un grafo es una estructura matemática que representa relaciones entre objetos. Consiste en NODOS (vértices) conectados por ARISTAS (edges). En logística, los nodos son ubicaciones y las aristas son rutas de transporte.',
    highlightNodes: [],
    highlightEdges: [],
    action: 'highlight'
  },
  {
    id: 2,
    title: 'Nodos en la Red Logística',
    description: 'Cada nodo representa una ubicación física: fábricas producen mercancía, almacenes la guardan, centros de distribución la organizan, y tiendas la venden. Observa cómo cada tipo tiene un color distintivo.',
    highlightNodes: ['factory-1', 'warehouse-1', 'warehouse-2', 'distribution-1', 'distribution-2', 'store-1', 'store-2', 'store-3'],
    highlightEdges: [],
    action: 'highlight'
  },
  {
    id: 3,
    title: 'Aristas y Rutas',
    description: 'Las aristas conectan los nodos y representan rutas de transporte. Cada ruta tiene propiedades: distancia (km), costo ($) y tiempo (min). Estas propiedades son los "pesos" del grafo.',
    highlightNodes: [],
    highlightEdges: ['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5', 'edge-6'],
    action: 'highlight'
  },
  {
    id: 4,
    title: 'Grafo Dirigido',
    description: 'Este es un grafo DIRIGIDO: las rutas tienen dirección. La mercancía fluye de izquierda a derecha, desde la fábrica hacia las tiendas. Las flechas indican la dirección permitida.',
    highlightNodes: ['factory-1'],
    highlightEdges: ['edge-1', 'edge-2'],
    action: 'animate'
  },
  {
    id: 5,
    title: 'Algoritmo de Dijkstra',
    description: 'Dijkstra encuentra la ruta MÁS CORTA entre dos nodos. Explora el grafo sistemáticamente, siempre eligiendo el camino con menor peso acumulado. Es óptimo para grafos con pesos no negativos.',
    highlightNodes: ['factory-1', 'store-3'],
    highlightEdges: [],
    action: 'calculate'
  },
  {
    id: 6,
    title: 'Ruta Óptima Encontrada',
    description: 'El algoritmo ha calculado la mejor ruta. Observa cómo el camión seguirá este camino, actualizando inventarios en cada parada. La eficiencia logística depende de optimizar estas rutas.',
    highlightNodes: [],
    highlightEdges: [],
    action: 'animate'
  },
  {
    id: 7,
    title: 'Aplicación en el Mundo Real',
    description: 'Empresas como Amazon, FedEx y UPS usan algoritmos similares para optimizar millones de entregas diarias. La teoría de grafos es fundamental en logística moderna, GPS y redes de comunicación.',
    highlightNodes: [],
    highlightEdges: [],
    action: 'complete'
  }
];

/**
 * CONFIGURACIÓN DE LA SIMULACIÓN
 *
 * MODELO LOGÍSTICO "BREAK-BULK" (relay):
 * ────────────────────────────────────────
 * Cada nodo intermedio actúa como receptor Y emisor:
 *   Fábrica     → envía cargoPerDelivery (50 unidades)
 *   Almacén     → recibe 50, retiene nodeKeep.warehouse (20), reenvía 30
 *   Distribución→ recibe 30, retiene nodeKeep.distribution (10), reenvía 20
 *   Tienda      → recibe 20 (stock final aumenta en 20)
 *
 * Esto refleja con fidelidad cómo operan las cadenas de suministro reales:
 * cada eslabón almacena una parte y pasa el resto al siguiente.
 */
export const SIMULATION_CONFIG = {
  // Velocidad base del camión (ms por paso)
  baseSpeed: 50,

  // Cantidad de mercancía que la fábrica carga al camión por entrega
  cargoPerDelivery: 50,

  // Intervalo de actualización (ms)
  updateInterval: 100,

  // Capacidad del camión
  truckCapacity: 100,

  /**
   * Unidades que RETIENE cada tipo de nodo intermedio al paso del camión.
   * El camión continúa con (cargo - keep) hacia el siguiente nodo.
   *
   * warehouse   : 50 recibidos → guarda 20 → reenvía 30
   * distribution: 30 recibidos → guarda 10 → reenvía 20
   */
  nodeKeep: {
    warehouse: 20,
    distribution: 10
  },

  // Velocidades disponibles
  speedOptions: [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '3x', value: 3 }
  ]
};
