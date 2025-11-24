import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="w-full py-4 md:py-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-4 md:top-5 h-0.5 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.number} className="flex flex-col items-center flex-1 min-w-0 px-1">
                <div
                  className={cn(
                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0",
                    isCompleted && "border-primary bg-primary text-primary-foreground shadow-glow",
                    isCurrent && "border-primary bg-background text-primary scale-110",
                    !isCompleted && !isCurrent && "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="text-xs md:text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="mt-2 md:mt-3 text-center w-full">
                  <p className={cn(
                    "text-[10px] md:text-sm font-medium transition-colors leading-tight",
                    (isCurrent || isCompleted) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="hidden md:block mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
