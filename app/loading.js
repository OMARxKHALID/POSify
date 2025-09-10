import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Background gradient skeleton */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-muted/20 to-transparent" />

      {/* Header skeleton */}
      <div className="sticky top-4 z-50 mx-auto max-w-5xl px-4 py-2">
        <div className="flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <section className="relative overflow-hidden min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-16 w-full max-w-3xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features section skeleton */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-border/50 rounded-xl p-6 space-y-4"
              >
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing section skeleton */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border border-border/50 rounded-xl p-8 space-y-6"
              >
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-24 mx-auto" />
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
