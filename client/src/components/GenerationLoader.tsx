import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TbWaveSine, TbBrain, TbMicrophone, TbLoader } from "react-icons/tb";
import AudioWaveform from "./AudioWaveform";

type GenerationStage = {
  name: string;
  icon: React.ReactNode;
  description: string;
  durationMs: number;
};

const stages: GenerationStage[] = [
  {
    name: "Analyzing",
    icon: <TbBrain className="h-5 w-5" />,
    description: "Analyzing text and preparing voice parameters",
    durationMs: 1500
  },
  {
    name: "Processing",
    icon: <TbLoader className="h-5 w-5 animate-spin" />,
    description: "Processing voice synthesis model",
    durationMs: 2500
  },
  {
    name: "Generating",
    icon: <TbWaveSine className="h-5 w-5" />,
    description: "Generating natural speech patterns",
    durationMs: 2000
  },
  {
    name: "Finalizing",
    icon: <TbMicrophone className="h-5 w-5" />,
    description: "Finalizing audio output",
    durationMs: 1000
  }
];

const stageItemVariants = cva(
  "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      state: {
        waiting: "text-gray-400 bg-gray-50",
        active: "text-primary-600 bg-primary-50 font-medium",
        completed: "text-green-600 bg-green-50"
      }
    },
    defaultVariants: {
      state: "waiting"
    }
  }
);

type StageItemProps = {
  stage: GenerationStage;
  state: "waiting" | "active" | "completed";
};

function StageItem({ stage, state }: StageItemProps) {
  return (
    <div className={cn(stageItemVariants({ state }))}>
      <div className="flex-shrink-0">
        {state === "completed" ? (
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-green-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          stage.icon
        )}
      </div>
      <div className="flex-grow">
        <div className="text-sm font-medium">{stage.name}</div>
        <div className="text-xs">{stage.description}</div>
      </div>
    </div>
  );
}

type GenerationLoaderProps = {
  isPending: boolean;
  length?: number; // Text length can affect generation progress
  onComplete?: () => void;
};

export default function GenerationLoader({ 
  isPending, 
  length = 100,
  onComplete
}: GenerationLoaderProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(isPending ? 0 : -1);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  
  // Calculate total duration based on content length (longer content takes more time)
  const lengthMultiplier = Math.max(1, Math.min(2, length / 500));
  const totalDuration = stages.reduce((sum, stage) => sum + stage.durationMs, 0) * lengthMultiplier;
  
  useEffect(() => {
    if (!isPending) {
      setProgress(0);
      setCurrentStageIndex(-1);
      setStageProgress(0);
      return;
    }
    
    let startTime = Date.now();
    let animationId: number;
    let stageStartTime = Date.now();
    let currentStage = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const elapsedInStage = Date.now() - stageStartTime;
      
      // Calculate overall progress
      const newProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(newProgress);
      
      // Calculate progress within the current stage
      if (currentStage < stages.length) {
        const stageDuration = stages[currentStage].durationMs * lengthMultiplier;
        const stagePercentage = Math.min(100, (elapsedInStage / stageDuration) * 100);
        setStageProgress(stagePercentage);
        
        // Move to next stage if current stage is complete
        if (elapsedInStage >= stageDuration) {
          stageStartTime = Date.now();
          currentStage += 1;
          setCurrentStageIndex(prev => Math.min(stages.length - 1, prev + 1));
        }
      }
      
      // Complete the animation
      if (elapsed < totalDuration) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Ensure we end at 100%
        setProgress(100);
        setStageProgress(100);
        setCurrentStageIndex(stages.length - 1);
        
        // Trigger completion callback after a small delay
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };
    
    setCurrentStageIndex(0);
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPending, totalDuration, lengthMultiplier, onComplete]);
  
  if (!isPending && currentStageIndex === -1) {
    return null;
  }
  
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AudioWaveform isActive={true} barCount={12} />
          <div>
            <h3 className="font-medium text-lg">Generating Audio</h3>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />
      
      <div className="grid grid-cols-1 gap-2 mt-4">
        {stages.map((stage, index) => (
          <StageItem
            key={stage.name}
            stage={stage}
            state={
              index < currentStageIndex
                ? "completed"
                : index === currentStageIndex
                ? "active"
                : "waiting"
            }
          />
        ))}
      </div>
      
      {currentStageIndex >= 0 && currentStageIndex < stages.length && (
        <div className="pt-2">
          <div className="text-xs text-gray-500 flex justify-between mb-1">
            <span>
              Stage {currentStageIndex + 1} of {stages.length}:{" "}
              {stages[currentStageIndex].name}
            </span>
            <span>{Math.round(stageProgress)}%</span>
          </div>
          <Progress value={stageProgress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}