import { useMemo } from "react";

type AudioWaveformProps = {
  isActive: boolean;
  barCount?: number;
};

export default function AudioWaveform({ isActive, barCount = 32 }: AudioWaveformProps) {
  // Generate random bar heights for visualization
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, () => Math.random() * 40 + 10);
  }, [barCount]);

  return (
    <div className="soundwave-container flex items-end justify-center w-full">
      <style jsx>{`
        .soundwave-container { 
          height: 64px; 
        }
        .soundwave-bar {
          width: 4px;
          margin: 0 1px;
          border-radius: 2px;
          background-color: currentColor;
          display: inline-block;
          transform-origin: bottom;
          transition: transform 0.2s ease;
        }
        .soundwave-bar.active {
          animation: wave 1s ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.05s);
        }
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(0.5); 
          }
          50% { 
            transform: scaleY(1.2); 
          }
        }
      `}</style>
      
      {bars.map((height, i) => (
        <div
          key={i}
          className={`soundwave-bar text-primary-500 ${isActive ? "active" : ""}`}
          style={{
            height: `${height}px`,
            "--index": i % 8,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
