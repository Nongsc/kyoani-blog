"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, FileText, User } from "lucide-react";

interface HeaderProps {
  siteTitle?: string;
}

export function Header({ siteTitle = "Kyoani Blog" }: HeaderProps) {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {siteTitle}
          </span>
        </Link>
        
        <nav className="flex items-center gap-1">
          <Link href="/">
            <Button 
              variant={pathname === "/" ? "secondary" : "ghost"} 
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          <Link href="/about">
            <Button 
              variant={pathname === "/about" ? "secondary" : "ghost"} 
              size="sm"
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
