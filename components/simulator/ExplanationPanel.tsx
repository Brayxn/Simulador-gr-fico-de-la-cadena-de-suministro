'use client';

/**
 * ============================================
 * COMPONENTE EXPLANATIONPANEL
 * ============================================
 * 
 * Panel de explicación educativa para el modo demostración.
 * Muestra paso a paso los conceptos de teoría de grafos.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ExplanationStep } from '@/lib/graph-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  BookOpen,
  Lightbulb,
  Network,
  GitBranch,
  Target,
  Route,
  CheckCircle2
} from 'lucide-react';

interface ExplanationPanelProps {
  steps: ExplanationStep[];
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onClose: () => void;
  isAnimating: boolean;
}

// Iconos para cada paso
const stepIcons: Record<string, React.ReactNode> = {
  '1': <Network className="w-6 h-6" />,
  '2': <Target className="w-6 h-6" />,
  '3': <GitBranch className="w-6 h-6" />,
  '4': <Route className="w-6 h-6" />,
  '5': <Lightbulb className="w-6 h-6" />,
  '6': <Target className="w-6 h-6" />,
  '7': <CheckCircle2 className="w-6 h-6" />,
};

export default function ExplanationPanel({
  steps,
  currentStep,
  onNextStep,
  onPrevStep,
  onClose,
  isAnimating
}: ExplanationPanelProps) {
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!step) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full border-b border-border bg-accent/5 backdrop-blur-md px-6 py-4 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-6 items-start">
        
        {/* Columna 1: Título y Progreso */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/20 text-accent shrink-0 mt-1">
            {stepIcons[step.id.toString()] || <BookOpen className="w-5 h-5" />}
          </div>
          <div className="flex flex-col w-full">
            <Badge variant="outline" className="w-fit text-[10px] mb-1">
              Paso {currentStep + 1} / {steps.length}
            </Badge>
            <h3 className="text-sm font-semibold text-foreground">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Columna 2: Descripción y animaciones */}
        <div className="flex flex-col justify-center h-full gap-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {step.description}
            </motion.p>
          </AnimatePresence>

          {/* Indicadores de acción */}
          {step.action === 'calculate' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20 w-fit"
            >
              <Lightbulb className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[11px] text-accent">
                Observa cómo el algoritmo calcula la mejor ruta...
              </span>
            </motion.div>
          )}

          {step.action === 'animate' && isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit"
            >
              <Route className="w-4 h-4 text-primary animate-bounce" />
              <span className="text-[11px] text-primary">
                Sigue el movimiento del camión por la ruta...
              </span>
            </motion.div>
          )}
          
          {step.action === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-chart-3/10 border border-chart-3/20 w-fit"
            >
              <CheckCircle2 className="w-4 h-4 text-chart-3" />
              <span className="text-[11px] text-chart-3">
                ¡Demostración completada!
              </span>
            </motion.div>
          )}
        </div>

        {/* Columna 3: Controles */}
        <div className="flex flex-col items-end justify-between h-full min-w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 md:static md:mb-2 text-muted-foreground hover:text-foreground h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex flex-col items-end gap-2 mt-auto w-full">
            <div className="flex gap-1 mb-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-accent' 
                      : index < currentStep 
                        ? 'bg-accent/50' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 w-full justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevStep}
                disabled={currentStep === 0}
                className="h-7 text-xs border-border"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Anterior
              </Button>
              
              <Button
                variant={currentStep === steps.length - 1 ? 'default' : 'outline'}
                size="sm"
                onClick={currentStep === steps.length - 1 ? onClose : onNextStep}
                className={`h-7 text-xs ${currentStep === steps.length - 1 ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'border-border'}`}
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-3 h-3 ml-1" />}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
