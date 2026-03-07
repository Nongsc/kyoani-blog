"use client";

import { useEffect, useState } from "react";

interface FooterProps {
  siteTitle?: string;
  siteAuthor?: string;
  hitokotoEnabled?: boolean;
  hitokotoType?: string;
  footerCopyright?: string;
  footerIcp?: string;
  footerTechLinks?: { title: string; url: string }[];
}

interface HitokotoResponse {
  hitokoto: string;
  from: string;
  from_who: string;
}

export function Footer({
  siteTitle = "Kyoani Blog",
  siteAuthor = "Admin",
  hitokotoEnabled = false,
  hitokotoType = "a",
  footerCopyright = "",
  footerIcp = "",
  footerTechLinks = [],
}: FooterProps) {
  const [hitokoto, setHitokoto] = useState<HitokotoResponse | null>(null);

  useEffect(() => {
    if (hitokotoEnabled) {
      fetch(`https://v1.hitokoto.cn?c=${hitokotoType}`)
        .then((res) => res.json())
        .then((data) => setHitokoto(data))
        .catch(() => console.error("Failed to fetch hitokoto"));
    }
  }, [hitokotoEnabled, hitokotoType]);

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* 一言区域 */}
        {hitokotoEnabled && hitokoto && (
          <div className="text-center mb-6">
            <p className="text-base text-muted-foreground italic">
              "{hitokoto.hitokoto}"
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              —— {hitokoto.from_who || "未知"}「{hitokoto.from}」
            </p>
          </div>
        )}

        {/* 分隔线 */}
        {hitokotoEnabled && hitokoto && (
          <div className="border-t border-border/50 mb-6" />
        )}

        {/* 底部信息 - 左右布局 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 左侧：版权信息 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              {footerCopyright || `© ${new Date().getFullYear()} ${siteTitle} - ${siteAuthor}`}
            </p>
            {footerIcp && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {footerIcp}
              </a>
            )}
          </div>

          {/* 右侧：链接 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {footerTechLinks.map((link, index) => (
              <span key={link.url} className="flex items-center gap-4">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {link.title}
                </a>
                {index < footerTechLinks.length - 1 && (
                  <span className="text-border">|</span>
                )}
              </span>
            ))}
            {hitokotoEnabled && footerTechLinks.length > 0 && (
              <>
                <span className="text-border">|</span>
                <a
                  href="https://hitokoto.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Hitokoto
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
