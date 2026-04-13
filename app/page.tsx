/**
 * ============================================
 * PÁGINA PRINCIPAL - SUPPLY CHAIN GRAPH SIMULATOR
 * ============================================
 * 
 * Esta es la página principal de la aplicación.
 * 
 * INSTRUCCIONES PARA EJECUTAR LOCALMENTE:
 * 
 * 1. Clonar o descargar el proyecto
 * 2. Ejecutar: npm install
 * 3. Ejecutar: npm run dev
 * 4. Abrir: http://localhost:3000
 * 
 * ESTRUCTURA DEL PROYECTO:
 * 
 * /app
 *   - page.tsx (esta página)
 *   - layout.tsx (configuración de fuentes y metadata)
 *   - globals.css (estilos globales y tema)
 * 
 * /components/simulator
 *   - SupplyChainSimulator.tsx (componente principal)
 *   - GraphCanvas.tsx (visualización SVG del grafo)
 *   - Dashboard.tsx (panel de control)
 *   - ExplanationPanel.tsx (modo explicación)
 *   - StatsChart.tsx (gráficos de estadísticas)
 * 
 * /lib
 *   - graph-types.ts (tipos de datos)
 *   - graph-data.ts (datos iniciales del grafo)
 *   - dijkstra.ts (algoritmo de ruta óptima)
 * 
 * /hooks
 *   - use-simulation.ts (lógica de simulación)
 * 
 * CÓMO MODIFICAR EL GRAFO:
 * 
 * Para agregar nodos: Editar INITIAL_NODES en /lib/graph-data.ts
 * Para agregar rutas: Editar INITIAL_EDGES en /lib/graph-data.ts
 * 
 * Ejemplo de nuevo nodo:
 * {
 *   id: 'nuevo-nodo',
 *   type: 'warehouse', // factory | warehouse | distribution | store
 *   name: 'Nuevo Almacén',
 *   x: 400, // posición X en el canvas
 *   y: 250, // posición Y en el canvas
 *   inventory: { current: 200, capacity: 400 },
 *   status: 'active'
 * }
 * 
 * Ejemplo de nueva ruta:
 * {
 *   id: 'nueva-ruta',
 *   source: 'nodo-origen',
 *   target: 'nodo-destino',
 *   distance: 50, // km
 *   cost: 100, // $
 *   time: 45, // minutos
 *   isActive: false
 * }
 */

import SupplyChainSimulator from '@/components/simulator/SupplyChainSimulator';

export default function HomePage() {
  return <SupplyChainSimulator />;
}
