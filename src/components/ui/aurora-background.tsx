"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AuroraBackground({
  children,
  className,
  colors = ["#7CB9E8", "#89CFF0", "#5DADE2", "#A8D8EA", "#B8D4E8", "#C8E0F0"],
  speed = 1,
}: AuroraBackgroundProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, #E8F4FC 0%, #D4EBF7 30%, #C0E2F2 60%, #A8D8EA 100%)`,
        }}
      />
      
      {/* Aurora layers */}
      <div 
        className="aurora-layer aurora-layer-1"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 20% 40%, ${colors[0]}40, transparent)`,
          animationDuration: `${15 / speed}s`,
        }}
      />
      <div 
        className="aurora-layer aurora-layer-2"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 80% 20%, ${colors[1]}40, transparent)`,
          animationDuration: `${20 / speed}s`,
        }}
      />
      <div 
        className="aurora-layer aurora-layer-3"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 70%, ${colors[2]}30, transparent)`,
          animationDuration: `${18 / speed}s`,
        }}
      />
      <div 
        className="aurora-layer aurora-layer-4"
        style={{
          background: `radial-gradient(ellipse 90% 40% at 30% 60%, ${colors[3]}30, transparent)`,
          animationDuration: `${22 / speed}s`,
        }}
      />
      <div 
        className="aurora-layer aurora-layer-5"
        style={{
          background: `radial-gradient(ellipse 50% 70% at 70% 80%, ${colors[4]}20, transparent)`,
          animationDuration: `${25 / speed}s`,
        }}
      />
      
      {/* Blur overlay for smooth effect */}
      <div 
        className="absolute inset-0 backdrop-blur-[60px]"
        style={{
          background: "transparent",
        }}
      />
      
      {/* Soft glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[40%]"
        style={{
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
