import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-primary/20 mb-4">
          404
        </h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          页面未找到
        </h2>
        
        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-md">
          抱歉，您访问的页面不存在或已被移除。
          请检查网址是否正确，或返回首页继续浏览。
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
          
          <Link href="/?search=true">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              搜索文章
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
