import { useState, useEffect, useMemo } from "react";

type AudioWaveformProps = {
  isActive: boolean;
  barCount?: number;
  variant?: "solid" | "gradient";
  animationSpeed?: "slow" | "normal" | "fast";
};

export default function AudioWaveform({ 
  isActive, 
  barCount = 32, 
  variant = "solid",
  animationSpeed = "normal"
}: AudioWaveformProps) {
  // Generate initial bar heights for visualization
  const initialBars = useMemo(() => {
    return Array.from({ length: barCount }, () => Math.random() * 40 + 10);
  }, [barCount]);
  
  // State to hold current bar heights
  const [bars, setBars] = useState(initialBars);
  
  // Dynamically update bar heights when active
  useEffect(() => {
    if (!isActive) return;
    
    // Set animation speed in milliseconds
    const speed = animationSpeed === "fast" ? 150 : animationSpeed === "slow" ? 450 : 250;
    
    const interval = setInterval(() => {
      setBars(prevBars => {
        // Only update a subset of bars for more natural movement
        const newBars = [...prevBars];
        for (let i = 0; i < barCount; i += 3) {
          const randomIndex = Math.floor(Math.random() * barCount);
          newBars[randomIndex] = Math.random() * 40 + 10;
        }
        return newBars;
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [isActive, barCount, animationSpeed]);

  // Get animation duration based on speed
  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case "fast": return "0.6s";
      case "slow": return "1.8s";
      default: return "1s";
    }
  };

  const animationDuration = getAnimationDuration();
  
  return (
    <div className="soundwave-container flex items-end justify-center w-full h-[64px]">
      <style>
        {`
        .soundwave-bar {
          width: 4px;
          margin: 0 1px;
          border-radius: 2px;
          background-color: currentColor;
          display: inline-block;
          transform-origin: bottom;
          transition: height 0.3s ease;
        }
        .soundwave-bar.active {
          animation: wave ${animationDuration} ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.05s);
        }
        .soundwave-bar.gradient {
          background: linear-gradient(to top, 
            var(--tw-color-primary-500) 0%, 
            var(--tw-color-primary-400) 50%,
            var(--tw-color-primary-300) 100%
          );
        }
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(0.5); 
          }
          50% { 
            transform: scaleY(1.2); 
          }
        }
        `}
      </style>
      
      {bars.map((height, i) => (
        <div
          key={i}
          className={`
            soundwave-bar 
            ${variant === "gradient" ? "gradient" : "text-primary-500"} 
            ${isActive ? "active" : ""}
          `}
          style={{
            height: `${height}px`,
            "--index": i % 8,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
