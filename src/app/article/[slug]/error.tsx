"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArticleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Article page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          文章加载失败
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {error.message || "抱歉，加载文章时遇到了问题。请稍后重试。"}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            重试
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>
        
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-6">
            错误代码: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
