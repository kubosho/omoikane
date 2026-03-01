'use client';

import { useEffect, useState } from 'react';

type UseIntersectionObserverOptions = {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions,
): { ref: (node?: Element | null) => void } {
  const { root = null, rootMargin = '0px', threshold = 0 } = options;
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (ref == null) {
      return;
    }

    const observer = new IntersectionObserver(callback, { root, rootMargin, threshold });
    observer.observe(ref);

    return () => observer.disconnect();
  }, [callback, ref, root, rootMargin, threshold]);

  return {
    ref: (node?: Element | null) => setRef(node ?? null),
  };
}
