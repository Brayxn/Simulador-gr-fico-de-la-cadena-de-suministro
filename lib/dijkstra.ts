/**
 * ============================================
 * ALGORITMO DE DIJKSTRA
 * ============================================
 * 
 * Implementación del algoritmo de Dijkstra para encontrar
 * la ruta más corta en un grafo ponderado.
 * 
 * TEORÍA:
 * El algoritmo de Dijkstra es un algoritmo de búsqueda de grafos
 * que resuelve el problema del camino más corto desde un nodo origen
 * a todos los demás nodos en grafos con pesos no negativos.
 * 
 * COMPLEJIDAD:
 * - Tiempo: O((V + E) log V) con cola de prioridad
 * - Espacio: O(V)
 * 
 * Donde V = número de vértices, E = número de aristas
 */

import { GraphNode, GraphEdge, CalculatedRoute } from './graph-types';

/**
 * Estructura para la cola de prioridad
 */
interface PriorityQueueItem {
  nodeId: string;
  distance: number;
}

/**
 * Cola de prioridad simple basada en array
 * En producción, se usaría un heap binario para mejor rendimiento
 */
class PriorityQueue {
  private items: PriorityQueueItem[] = [];

  enqueue(nodeId: string, distance: number): void {
    this.items.push({ nodeId, distance });
    this.items.sort((a, b) => a.distance - b.distance);
  }

  dequeue(): PriorityQueueItem | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  updatePriority(nodeId: string, newDistance: number): void {
    const index = this.items.findIndex(item => item.nodeId === nodeId);
    if (index !== -1) {
      this.items[index].distance = newDistance;
      this.items.sort((a, b) => a.distance - b.distance);
    }
  }

  contains(nodeId: string): boolean {
    return this.items.some(item => item.nodeId === nodeId);
  }
}

/**
 * Tipo de peso a optimizar
 */
export type WeightType = 'distance' | 'cost' | 'time';

/**
 * ALGORITMO DE DIJKSTRA
 * 
 * @param nodes - Lista de nodos del grafo
 * @param edges - Lista de aristas del grafo
 * @param sourceId - ID del nodo origen
 * @param targetId - ID del nodo destino
 * @param weightType - Tipo de peso a optimizar (distancia, costo o tiempo)
 * @returns Ruta calculada con el camino óptimo
 * 
 * FUNCIONAMIENTO:
 * 1. Inicializar distancias: origen = 0, resto = infinito
 * 2. Agregar origen a la cola de prioridad
 * 3. Mientras la cola no esté vacía:
 *    a. Extraer nodo con menor distancia
 *    b. Si es el destino, terminar
 *    c. Para cada vecino:
 *       - Calcular nueva distancia
 *       - Si es menor, actualizar y agregar a cola
 * 4. Reconstruir el camino desde el destino al origen
 */
export function dijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string,
  targetId: string,
  weightType: WeightType = 'distance'
): CalculatedRoute | null {
  // Paso 1: Inicialización
  const distances: Map<string, number> = new Map();
  const previous: Map<string, string | null> = new Map();
  const previousEdge: Map<string, GraphEdge | null> = new Map();
  const visited: Set<string> = new Set();
  const queue = new PriorityQueue();

  // Inicializar todas las distancias como infinito
  nodes.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    previousEdge.set(node.id, null);
  });

  // La distancia del origen a sí mismo es 0
  distances.set(sourceId, 0);
  queue.enqueue(sourceId, 0);

  // Paso 2: Procesar la cola
  while (!queue.isEmpty()) {
    const current = queue.dequeue();
    if (!current) break;

    const currentNodeId = current.nodeId;

    // Si llegamos al destino, terminamos
    if (currentNodeId === targetId) {
      break;
    }

    // Si ya visitamos este nodo, continuamos
    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);

    // Obtener todas las aristas que salen del nodo actual
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);

    // Paso 3: Relajar aristas (actualizar distancias)
    for (const edge of outgoingEdges) {
      const neighborId = edge.target;
      
      // Obtener el peso según el tipo seleccionado
      let weight: number;
      switch (weightType) {
        case 'cost':
          weight = edge.cost;
          break;
        case 'time':
          weight = edge.time;
          break;
        default:
          weight = edge.distance;
      }

      const newDistance = (distances.get(currentNodeId) ?? Infinity) + weight;

      // Si encontramos un camino más corto
      if (newDistance < (distances.get(neighborId) ?? Infinity)) {
        distances.set(neighborId, newDistance);
        previous.set(neighborId, currentNodeId);
        previousEdge.set(neighborId, edge);
        
        if (queue.contains(neighborId)) {
          queue.updatePriority(neighborId, newDistance);
        } else {
          queue.enqueue(neighborId, newDistance);
        }
      }
    }
  }

  // Paso 4: Reconstruir el camino
  if (distances.get(targetId) === Infinity) {
    // No hay camino posible
    return null;
  }

  const path: string[] = [];
  const routeEdges: GraphEdge[] = [];
  let currentNode: string | null = targetId;

  while (currentNode !== null) {
    path.unshift(currentNode);
    const edge = previousEdge.get(currentNode);
    if (edge) {
      routeEdges.unshift(edge);
    }
    currentNode = previous.get(currentNode) ?? null;
  }

  // Calcular totales
  let totalDistance = 0;
  let totalCost = 0;
  let totalTime = 0;

  for (const edge of routeEdges) {
    totalDistance += edge.distance;
    totalCost += edge.cost;
    totalTime += edge.time;
  }

  return {
    path,
    totalDistance,
    totalCost,
    totalTime,
    edges: routeEdges
  };
}

/**
 * Encontrar todas las rutas posibles entre dos nodos
 * Útil para comparar y mostrar alternativas
 */
export function findAllPaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string,
  targetId: string,
  maxDepth: number = 10
): string[][] {
  const allPaths: string[][] = [];
  
  function dfs(currentId: string, path: string[], depth: number): void {
    if (depth > maxDepth) return;
    
    if (currentId === targetId) {
      allPaths.push([...path]);
      return;
    }
    
    const outgoingEdges = edges.filter(edge => edge.source === currentId);
    
    for (const edge of outgoingEdges) {
      if (!path.includes(edge.target)) {
        path.push(edge.target);
        dfs(edge.target, path, depth + 1);
        path.pop();
      }
    }
  }
  
  dfs(sourceId, [sourceId], 0);
  return allPaths;
}

/**
 * Calcular métricas para una ruta específica
 */
export function calculateRouteMetrics(
  path: string[],
  edges: GraphEdge[]
): { distance: number; cost: number; time: number } {
  let distance = 0;
  let cost = 0;
  let time = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => e.source === path[i] && e.target === path[i + 1]);
    if (edge) {
      distance += edge.distance;
      cost += edge.cost;
      time += edge.time;
    }
  }
  
  return { distance, cost, time };
}
