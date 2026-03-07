"use client";

import { cn } from "@/lib/utils";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AuroraText({
  children,
  className,
  colors = ["#7CB9E8", "#89CFF0", "#5DADE2", "#A8D8EA", "#B8D4E8"],
  speed = 1,
}: AuroraTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    backgroundSize: "300% 300%",
    animation: `aurora-gradient ${8 / speed}s ease infinite`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <span className={cn("relative inline-block", className)} style={gradientStyle}>
      {children}
    </span>
  );
}
