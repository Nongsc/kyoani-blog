"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";
import { AuroraBackground } from "@/components/ui/aurora-background";

interface HitokotoResponse {
  hitokoto: string;
  from: string;
  from_who: string;
}

interface HeroSectionProps {
  siteTitle?: string;
  siteDescription?: string;
  hitokotoEnabled?: boolean;
  hitokotoType?: string;
}

export function HeroSection({ 
  siteTitle = "天空中的紫罗兰",
  siteDescription = "一个安静的角落，记录思绪、故事与心灵的低语",
  hitokotoEnabled = false,
  hitokotoType = "a"
}: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hitokoto, setHitokoto] = useState<HitokotoResponse | null>(null);

  // Memoize scroll handler to prevent recreation on each render
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  // Memoize scroll function
  const scrollToContent = useCallback(() => {
    const contentSection = document.getElementById("content-section");
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (hitokotoEnabled) {
      fetch(`https://v1.hitokoto.cn?c=${hitokotoType}`)
        .then((res) => res.json())
        .then((data) => setHitokoto(data))
        .catch(() => console.error("Failed to fetch hitokoto"));
    }
  }, [hitokotoEnabled, hitokotoType]);

  const displayDescription = hitokotoEnabled && hitokoto
    ? hitokoto.hitokoto
    : siteDescription;

  const displaySource = hitokotoEnabled && hitokoto
    ? `—— ${hitokoto.from_who || "未知"}「${hitokoto.from}」`
    : null;

  return (
    <section 
      className={`relative w-full h-screen min-h-[600px] overflow-hidden transition-opacity duration-500 ${isScrolled ? "opacity-30" : "opacity-100"}`}
    >
      <AuroraBackground className="absolute inset-0">
        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] mb-6" style={{ color: "#2C3E50" }}>
            {siteTitle}
          </h1>
          
          <div className="max-w-2xl">
            {hitokotoEnabled ? (
              <>
                <AuroraText className="text-xl md:text-2xl font-light">
                  {displayDescription}
                </AuroraText>
                {displaySource && (
                  <span className="block mt-4 text-sm text-muted-foreground">
                    {displaySource}
                  </span>
                )}
              </>
            ) : (
              <p className="text-lg md:text-xl font-light text-muted-foreground tracking-wide">
                {displayDescription}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            className="absolute bottom-8 text-muted-foreground hover:text-foreground hover:bg-white/20 transition-all"
            onClick={scrollToContent}
          >
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </Button>
        </div>
      </AuroraBackground>
    </section>
  );
}
