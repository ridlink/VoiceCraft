import { useState, useEffect, useMemo } from "react";

type AudioWaveformProps = {
  isActive: boolean;
  barCount?: number;
  variant?: "solid" | "gradient" | "rainbow";
  animationSpeed?: "slow" | "normal" | "fast";
  height?: number;
};

export default function AudioWaveform({ 
  isActive, 
  barCount = 36, 
  variant = "rainbow",
  animationSpeed = "normal",
  height = 64
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
    const speed = animationSpeed === "fast" ? 120 : animationSpeed === "slow" ? 350 : 200;
    
    const interval = setInterval(() => {
      setBars(prevBars => {
        // Only update a subset of bars for more natural movement
        const newBars = [...prevBars];
        for (let i = 0; i < barCount; i += 2) {
          const randomIndex = Math.floor(Math.random() * barCount);
          // More varied heights for more dynamic appearance
          newBars[randomIndex] = Math.random() * 45 + 10;
        }
        return newBars;
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [isActive, barCount, animationSpeed]);

  // Get animation duration based on speed
  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case "fast": return "0.5s";
      case "slow": return "1.5s";
      default: return "0.8s";
    }
  };

  const animationDuration = getAnimationDuration();
  
  // Generate colors for rainbow variant
  const rainbowColors = [
    "#9b5de5", // Purple
    "#f15bb5", // Pink
    "#fee440", // Yellow
    "#00bbf9", // Blue
    "#00f5d4", // Cyan
  ];
  
  return (
    <div className="soundwave-container flex items-end justify-center w-full" style={{ height: `${height}px` }}>
      <style>
        {`
        .soundwave-bar {
          width: 3px;
          margin: 0 1px;
          border-radius: 4px;
          background-color: currentColor;
          display: inline-block;
          transform-origin: bottom;
          transition: height 0.2s ease-out;
          opacity: 0.85;
        }
        .soundwave-bar.active {
          animation: wave ${animationDuration} ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.04s);
        }
        .soundwave-bar.gradient {
          background: linear-gradient(to top, 
            var(--tw-color-primary-600) 0%, 
            var(--tw-color-primary-400) 50%,
            var(--tw-color-primary-300) 100%
          );
        }
        .soundwave-bar.rainbow {
          background: var(--bar-color);
          box-shadow: 0 0 3px rgba(var(--bar-shadow), 0.4);
        }
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(0.4); 
            opacity: 0.8;
          }
          50% { 
            transform: scaleY(1.2); 
            opacity: 1;
          }
        }
        `}
      </style>
      
      {bars.map((height, i) => {
        // For rainbow variant, calculate color
        const barColor = variant === "rainbow" 
          ? rainbowColors[i % rainbowColors.length]
          : undefined;
          
        // Extract RGB values for shadow - convert hex to rgb
        let shadowRGB = "";
        if (barColor) {
          const r = parseInt(barColor.slice(1, 3), 16);
          const g = parseInt(barColor.slice(3, 5), 16);
          const b = parseInt(barColor.slice(5, 7), 16);
          shadowRGB = `${r}, ${g}, ${b}`;
        }
        
        return (
          <div
            key={i}
            className={`
              soundwave-bar 
              ${variant === "gradient" ? "gradient" : variant === "rainbow" ? "rainbow" : "text-primary-500"} 
              ${isActive ? "active" : ""}
            `}
            style={{
              height: `${height}px`,
              "--index": i % 8,
              "--bar-color": barColor,
              "--bar-shadow": shadowRGB,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
