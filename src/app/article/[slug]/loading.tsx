import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-24" />
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr]">
        {/* TOC skeleton - hidden on mobile */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" style={{ marginLeft: `${i * 8}px` }} />
              ))}
            </div>
          </div>
        </aside>
        
        {/* Content skeleton */}
        <div className="min-w-0 space-y-6">
          {/* Title skeleton */}
          <div className="space-y-4 pb-6 border-b border-border">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Related posts skeleton */}
          <div className="pt-8 border-t border-border">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
