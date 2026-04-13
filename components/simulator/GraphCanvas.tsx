'use client';

/**
 * ============================================
 * COMPONENTE GRAPHCANVAS
 * ============================================
 * 
 * Renderiza el grafo logístico usando SVG.
 * Incluye nodos, aristas, camión animado y efectos visuales.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { GraphNode, GraphEdge, Truck, NODE_CONFIG, CalculatedRoute } from '@/lib/graph-types';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truck: Truck;
  calculatedRoute: CalculatedRoute | null;
  highlightedNodes: string[];
  highlightedEdges: string[];
  selectedNode: GraphNode | null;
  onNodeClick: (node: GraphNode) => void;
  explanationMode: boolean;
}

/**
 * Componente principal del canvas SVG
 */
export default function GraphCanvas({
  nodes,
  edges,
  truck,
  calculatedRoute,
  highlightedNodes,
  highlightedEdges,
  selectedNode,
  onNodeClick,
  explanationMode
}: GraphCanvasProps) {
  // Calcular posición actual del camión
  const getTruckPosition = () => {
    if (!truck.isMoving || !truck.targetNodeId) {
      const currentNode = nodes.find(n => n.id === truck.currentNodeId);
      return currentNode ? { x: currentNode.x, y: currentNode.y } : { x: 0, y: 0 };
    }

    const sourceNode = nodes.find(n => n.id === truck.currentNodeId);
    const targetNode = nodes.find(n => n.id === truck.targetNodeId);

    if (!sourceNode || !targetNode) return { x: 0, y: 0 };

    // Interpolación lineal entre nodos
    const x = sourceNode.x + (targetNode.x - sourceNode.x) * truck.progress;
    const y = sourceNode.y + (targetNode.y - sourceNode.y) * truck.progress;

    return { x, y };
  };

  const truckPos = getTruckPosition();

  // Verificar si una arista es parte de la ruta calculada
  const isEdgeInRoute = (edgeId: string) => {
    return calculatedRoute?.edges.some(e => e.id === edgeId) || false;
  };

  // Verificar si un nodo es parte de la ruta calculada
  const isNodeInRoute = (nodeId: string) => {
    return calculatedRoute?.path.includes(nodeId) || false;
  };

  return (
    <div className="relative w-full h-full bg-background rounded-xl overflow-hidden border border-border">
      {/* Patrón de fondo tipo grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <svg 
        viewBox="0 0 900 500" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradientes para efectos de glow */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Marcador de flecha para aristas */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--muted-foreground)"
              opacity="0.5"
            />
          </marker>

          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--primary)"
            />
          </marker>

          {/* Gradiente animado para rutas activas */}
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3">
              <animate attributeName="offset" values="-1;1" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="1">
              <animate attributeName="offset" values="-0.5;1.5" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3">
              <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>
        </defs>

        {/* CAPA 1: Aristas (rutas) */}
        <g className="edges-layer">
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const isInRoute = isEdgeInRoute(edge.id);
            const isHighlighted = highlightedEdges.includes(edge.id);
            const isActive = edge.isActive || isInRoute;

            // Calcular punto medio para la etiqueta
            let midX = (sourceNode.x + targetNode.x) / 2;
            let midY = (sourceNode.y + targetNode.y) / 2;

            // Para las rutas directas largas, dibujar curva y mover la etiqueta para evitar sobreponerse
            let isCurved = false;
            let pathData = '';
            
            if (edge.id === 'edge-11') {
              isCurved = true;
              pathData = `M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY - 80} ${targetNode.x} ${targetNode.y}`;
              midY -= 40; // Mover etiqueta arriba
            } else if (edge.id === 'edge-12') {
              isCurved = true;
              pathData = `M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY + 80} ${targetNode.x} ${targetNode.y}`;
              midY += 40; // Mover etiqueta abajo
            }

            return (
              <g key={edge.id}>
                {/* Línea de la arista */}
                {isCurved ? (
                  <motion.path
                    d={pathData}
                    fill="transparent"
                    stroke={isActive ? 'var(--primary)' : 'var(--muted-foreground)'}
                    strokeWidth={isActive ? 3 : 2}
                    strokeOpacity={isActive ? 1 : 0.3}
                    markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    filter={isActive ? 'url(#glow)' : undefined}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: 1,
                      strokeOpacity: isHighlighted ? 1 : (isActive ? 1 : 0.3)
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <motion.line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isActive ? 'var(--primary)' : 'var(--muted-foreground)'}
                    strokeWidth={isActive ? 3 : 2}
                    strokeOpacity={isActive ? 1 : 0.3}
                    markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    filter={isActive ? 'url(#glow)' : undefined}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: 1,
                      strokeOpacity: isHighlighted ? 1 : (isActive ? 1 : 0.3)
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Animación de flujo para rutas activas */}
                {isActive && (
                  isCurved ? (
                    <motion.path
                      d={pathData}
                      fill="transparent"
                      stroke="url(#route-gradient)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                    />
                  ) : (
                    <motion.line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="url(#route-gradient)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                    />
                  )
                )}

                {/* Etiqueta de la arista */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-35"
                    y="-12"
                    width="70"
                    height="24"
                    rx="4"
                    fill="var(--card)"
                    fillOpacity="0.9"
                    stroke={isActive ? 'var(--primary)' : 'var(--border)'}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="10"
                    fill="var(--foreground)"
                    className="font-mono"
                  >
                    {edge.distance}km · ${edge.cost}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* CAPA 2: Nodos */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            const config = NODE_CONFIG[node.type];
            const isInRoute = isNodeInRoute(node.id);
            const isHighlighted = highlightedNodes.includes(node.id);
            const isSelected = selectedNode?.id === node.id;
            const isCurrent = truck.currentNodeId === node.id;
            const isTarget = truck.targetNodeId === node.id;

            // Calcular porcentaje de inventario
            const inventoryPercent = (node.inventory.current / node.inventory.capacity) * 100;

            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isHighlighted || isSelected ? 1.1 : 1, 
                  opacity: 1 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => onNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Círculo de glow para nodos activos */}
                {(isInRoute || isHighlighted || isCurrent) && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={45}
                    fill={config.color}
                    fillOpacity={0.2}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      opacity: [0.2, 0.4, 0.2] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                {/* Círculo principal del nodo */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={35}
                  fill="var(--card)"
                  stroke={isSelected ? 'var(--primary)' : config.color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isInRoute || isSelected ? 'url(#glow)' : undefined}
                />

                {/* Barra de inventario circular */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={38}
                  fill="none"
                  stroke={config.color}
                  strokeWidth={4}
                  strokeDasharray={`${(inventoryPercent / 100) * 239} 239`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${node.x} ${node.y})`}
                  opacity={0.8}
                />

                {/* Icono del nodo */}
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="8"
                  fontSize="24"
                >
                  {config.icon}
                </text>

                {/* Nombre del nodo */}
                <text
                  x={node.x}
                  y={node.y + 50}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--foreground)"
                  fontWeight="500"
                  className="font-sans"
                >
                  {node.name}
                </text>

                {/* Indicador de inventario */}
                <g transform={`translate(${node.x + 30}, ${node.y - 30})`}>
                  <rect
                    x="-20"
                    y="-10"
                    width="40"
                    height="20"
                    rx="4"
                    fill={node.status === 'critical' ? 'var(--destructive)' : 
                          node.status === 'warning' ? 'var(--chart-4)' : 
                          'var(--secondary)'}
                    fillOpacity="0.9"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="10"
                    fill="var(--foreground)"
                    fontWeight="600"
                    className="font-mono"
                  >
                    {node.inventory.current}
                  </text>
                </g>

                {/* Indicador de nodo actual del camión */}
                {isCurrent && !truck.isMoving && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={42}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}
              </motion.g>
            );
          })}
        </g>

        {/* CAPA 3: Camion animado */}
        <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
          <motion.g
            key="truck"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 15 
            }}
          >
            {/* Sombra del camión */}
            <ellipse
              cx={0}
              cy={15}
              rx={20}
              ry={5}
              fill="black"
              fillOpacity={0.3}
            />
            
            {/* Cuerpo del camión */}
            <rect
              x={-18}
              y={-15}
              width={36}
              height={25}
              rx={4}
              fill="var(--primary)"
              stroke="var(--primary-foreground)"
              strokeWidth={1}
            />
            
            {/* Cabina del camión */}
            <rect
              x={-25}
              y={-10}
              width={12}
              height={20}
              rx={3}
              fill="var(--primary)"
              stroke="var(--primary-foreground)"
              strokeWidth={1}
            />
            
            {/* Ventana */}
            <rect
              x={-23}
              y={-7}
              width={8}
              height={8}
              rx={1}
              fill="var(--accent)"
              fillOpacity={0.8}
            />
            
            {/* Ruedas */}
            <circle cx={-10} cy={12} r={5} fill="var(--secondary)" />
            <circle cx={10} cy={12} r={5} fill="var(--secondary)" />
            <circle cx={-10} cy={12} r={2} fill="var(--muted)" />
            <circle cx={10} cy={12} r={2} fill="var(--muted)" />

            {/* Indicador de carga */}
            {truck.cargo > 0 && (
              <g>
                <rect
                  x={-12}
                  y={-25}
                  width={24}
                  height={14}
                  rx={3}
                  fill="var(--chart-4)"
                  stroke="var(--foreground)"
                  strokeWidth={0.5}
                />
                <text
                  x={0}
                  y={-15}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--foreground)"
                  fontWeight="bold"
                >
                  {truck.cargo}
                </text>
              </g>
            )}

            {/* Efecto de movimiento */}
            {truck.isMoving && (
              <>
                <motion.line
                  x1={-30}
                  y1={-5}
                  x2={-45}
                  y2={-5}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [-5, -15] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.line
                  x1={-30}
                  y1={0}
                  x2={-50}
                  y2={0}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [-5, -20] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                />
                <motion.line
                  x1={-30}
                  y1={5}
                  x2={-40}
                  y2={5}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [-5, -10] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                />
              </>
            )}
          </motion.g>
        </g>

        {/* Camión llegando a destino final */}
        {truck.pathIndex === calculatedRoute.length - 1 && !truck.isMoving && calculatedRoute.length > 0 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none"
            transform={`translate(${nodes.find(n => n.id === truck.targetNodeId)?.x || 0}, ${(nodes.find(n => n.id === truck.targetNodeId)?.y || 0) - 60})`}
          >
            <circle cx="0" cy="0" r="15" fill="var(--chart-3)" opacity="0.2" />
            <circle cx="0" cy="0" r="10" fill="var(--chart-3)" />
            <path d="M-4 0 L-1 3 L5 -3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        )}
      </svg>

      {/* Leyenda HTML flotante para ajustarse al borde de pantalla */}
      {explanationMode && (
        <div className="absolute bottom-4 left-4 z-10 bg-card/95 border border-border rounded-lg shadow-md p-3 max-w-sm backdrop-blur-sm pointer-events-none">
          <div className="text-[11px] font-semibold text-muted-foreground mb-2 px-1">
            LEYENDA:
          </div>
          <div className="flex items-center gap-4 flex-wrap px-1">
            {Object.entries(NODE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-base">{config.icon}</span>
                <span className="text-[10px] text-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
