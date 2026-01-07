import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message?: string;
}

interface GenerationProgressProps {
  steps: Step[];
}

export function GenerationProgress({ steps }: GenerationProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {step.status === 'complete' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : step.status === 'in-progress' ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : step.status === 'error' ? (
                <Circle className="w-6 h-6 text-red-500" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground/30" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${
                  step.status === 'complete' ? 'text-foreground' :
                  step.status === 'in-progress' ? 'text-primary' :
                  step.status === 'error' ? 'text-red-500' :
                  'text-muted-foreground'
                }`}>
                  {step.title}
                </h3>
              </div>
              
              {step.message && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.message}
                </p>
              )}

              {step.status === 'in-progress' && (
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
