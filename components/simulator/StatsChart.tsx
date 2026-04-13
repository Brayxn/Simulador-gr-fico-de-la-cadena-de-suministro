'use client';

/**
 * ============================================
 * COMPONENTE STATSCHART
 * ============================================
 * 
 * Gráficos de estadísticas en tiempo real usando Recharts.
 * Muestra métricas de transporte, inventario y eficiencia.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationStats, GraphNode } from '@/lib/graph-types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  Activity,
  BarChart3
} from 'lucide-react';

interface StatsChartProps {
  stats: SimulationStats;
  nodes: GraphNode[];
  isRunning: boolean;
}

interface DataPoint {
  time: number;
  transported: number;
  cost: number;
  efficiency: number;
}

export default function StatsChart({ stats, nodes, isRunning }: StatsChartProps) {
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [timeCounter, setTimeCounter] = useState(0);

  // Actualizar historial de datos
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimeCounter(prev => prev + 1);
        setHistoryData(prev => {
          const newData = [
            ...prev.slice(-19), // Mantener últimos 20 puntos
            {
              time: timeCounter,
              transported: stats.totalTransported,
              cost: stats.totalCost,
              efficiency: stats.efficiency
            }
          ];
          return newData;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, stats, timeCounter]);

  // Datos de inventario por nodo
  const inventoryData = nodes.map(node => ({
    name: node.name.split(' ')[0],
    current: node.inventory.current,
    capacity: node.inventory.capacity,
    fill: `var(--chart-${(nodes.indexOf(node) % 5) + 1})`
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">Tiempo: {label}s</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'transported' ? 'Transportado: ' : 
               entry.dataKey === 'cost' ? 'Costo: $' :
               'Eficiencia: '}
              {entry.value.toFixed(1)}
              {entry.dataKey === 'efficiency' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Métricas en Tiempo Real
          </CardTitle>
          <Badge variant={isRunning ? 'default' : 'secondary'} className="text-[10px]">
            {isRunning ? 'Actualizando' : 'En espera'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transport" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="transport" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Transporte
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Eficiencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transport" className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorTransported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  tickFormatter={(value) => `${value}s`}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={24}
                  formatter={(value) => (
                    <span className="text-xs text-foreground">
                      {value === 'transported' ? 'Transportado' : 'Costo ($)'}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="transported" 
                  stroke="var(--chart-1)" 
                  fill="url(#colorTransported)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="var(--chart-2)" 
                  fill="url(#colorCost)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="inventory" className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'current' ? 'Actual' : 'Capacidad'
                  ]}
                />
                <Legend 
                  verticalAlign="top"
                  height={24}
                  formatter={(value) => (
                    <span className="text-xs text-foreground">
                      {value === 'current' ? 'Actual' : 'Capacidad'}
                    </span>
                  )}
                />
                <Bar dataKey="current" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="capacity" fill="var(--chart-3)" opacity={0.3} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="efficiency" className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  tickFormatter={(value) => `${value}s`}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={24}
                  formatter={() => (
                    <span className="text-xs text-foreground">Eficiencia Logística</span>
                  )}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--chart-3)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--chart-3)', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, fill: 'var(--chart-3)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {/* Indicadores rápidos */}
        <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-border">
          <motion.div 
            className="text-center"
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0, repeatDelay: 2 }}
          >
            <div className="text-lg font-bold text-chart-1">{stats.totalTransported}</div>
            <div className="text-[9px] text-muted-foreground">Transportado</div>
          </motion.div>
          <div className="text-center">
            <div className="text-lg font-bold text-chart-2">${stats.totalCost}</div>
            <div className="text-[9px] text-muted-foreground">Costo Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-chart-3">{stats.totalDistance}km</div>
            <div className="text-[9px] text-muted-foreground">Distancia</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-chart-4">{stats.deliveriesCompleted}</div>
            <div className="text-[9px] text-muted-foreground">Entregas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
