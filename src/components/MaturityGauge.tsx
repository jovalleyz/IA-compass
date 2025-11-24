import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MaturityGaugeProps {
  score: number; // 0-5
  level: string; // Inicial, Intermedio, Avanzado
  className?: string;
}

const MaturityGauge = ({ score, level, className }: MaturityGaugeProps) => {
  // Convert score (0-5) to percentage (0-100)
  const percentage = (score / 5) * 100;
  
  // Calculate rotation for needle (-90deg to 90deg)
  const rotation = -90 + (percentage * 180) / 100;

  // Determine color based on level
  const getColor = () => {
    if (level === "Avanzado") return "hsl(var(--primary))";
    if (level === "Intermedio") return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getLevelColor = () => {
    if (level === "Avanzado") return "text-primary";
    if (level === "Intermedio") return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-center">Nivel de Madurez para IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gauge SVG */}
        <div className="relative w-full max-w-xs mx-auto aspect-[2/1]">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Background arc segments */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="12"
              strokeOpacity="0.3"
              strokeDasharray="84 1000"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="12"
              strokeOpacity="0.3"
              strokeDasharray="0 84 84 1000"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeOpacity="0.3"
              strokeDasharray="0 168 84 1000"
            />

            {/* Active arc based on score */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={getColor()}
              strokeWidth="12"
              strokeDasharray={`${(percentage * 252) / 100} 1000`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />

            {/* Center circle */}
            <circle cx="100" cy="90" r="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" />

            {/* Needle */}
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="20"
              stroke={getColor()}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 90)`}
              className="transition-transform duration-1000 ease-out"
            />

            {/* Tick marks */}
            {[0, 1, 2, 3, 4, 5].map((tick) => {
              const angle = -90 + (tick / 5) * 180;
              const x1 = 100 + 75 * Math.cos((angle * Math.PI) / 180);
              const y1 = 90 + 75 * Math.sin((angle * Math.PI) / 180);
              const x2 = 100 + 85 * Math.cos((angle * Math.PI) / 180);
              const y2 = 90 + 85 * Math.sin((angle * Math.PI) / 180);
              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="2"
                />
              );
            })}

            {/* Labels */}
            <text x="20" y="100" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">0</text>
            <text x="100" y="15" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">2.5</text>
            <text x="180" y="100" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">5</text>
          </svg>
        </div>

        {/* Score and Level Display */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold" style={{ color: getColor() }}>
            {score.toFixed(1)}
          </div>
          <div className={cn("text-2xl font-semibold", getLevelColor())}>
            {level}
          </div>
          <p className="text-sm text-muted-foreground">
            Puntaje de madurez organizacional
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="w-4 h-4 rounded-full bg-destructive/30 mx-auto mb-1"></div>
            <div className="font-medium">Inicial</div>
            <div className="text-xs text-muted-foreground">0 - 2.4</div>
          </div>
          <div>
            <div className="w-4 h-4 rounded-full bg-warning/30 mx-auto mb-1"></div>
            <div className="font-medium">Intermedio</div>
            <div className="text-xs text-muted-foreground">2.5 - 3.4</div>
          </div>
          <div>
            <div className="w-4 h-4 rounded-full bg-primary/30 mx-auto mb-1"></div>
            <div className="font-medium">Avanzado</div>
            <div className="text-xs text-muted-foreground">3.5 - 5.0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaturityGauge;
