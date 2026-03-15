"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, FileText, User } from "lucide-react";

interface HeaderProps {
  siteTitle?: string;
}

// Static navigation items - defined outside component to prevent recreation
const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/about", icon: User, label: "About" },
] as const;

export const Header = memo(function Header({ siteTitle = "Kyoani Blog" }: HeaderProps) {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label="返回首页">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center" aria-hidden="true">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {siteTitle}
          </span>
        </Link>
        
        <nav className="flex items-center gap-1" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
});
