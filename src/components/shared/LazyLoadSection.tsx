import { useRef, useEffect, useState, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Wrapper component for lazy loading sections below the fold
 * Use for cross-sell, FAQ, trust indicators, etc.
 */
interface LazyLoadSectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string;
  className?: string;
}

export default function LazyLoadSection({
  children,
  fallback,
  rootMargin = '200px',
  threshold = 0.1,
  minHeight = '200px',
  className = '',
}: LazyLoadSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If intersection observer not supported, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasLoaded]);

  const defaultFallback = (
    <div className="animate-pulse space-y-4 p-4" style={{ minHeight }}>
      <Skeleton className="h-6 w-1/3" />
      <div className="grid sm:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={className} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
}
