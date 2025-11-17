'use client';

import { useEffect, useRef, useState } from 'react';

type State = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};

type UseIntersectionObserverOptions = {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
};

type UseIntersectionObserverReturn = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
  ref: (node?: Element | null) => void;
};

const ROOT_SENTINEL = {} as HTMLElement;

const _intersectionObserver = new WeakMap<HTMLElement, Record<string, ReturnType<typeof createIntersectionObserver>>>();
function getIntersectionObserverInstance(options: UseIntersectionObserverOptions) {
  const { root, ...keys } = options;
  const cacheKey = JSON.stringify(keys);
  const weakMapKey = root ?? ROOT_SENTINEL;

  let base = _intersectionObserver.get(weakMapKey);
  if (base == null) {
    base = {};
    _intersectionObserver.set(weakMapKey, base);
  }

  return (base[cacheKey] ??= createIntersectionObserver(options));
}

function createIntersectionObserver(options: UseIntersectionObserverOptions) {
  const { root = null, rootMargin = '0px', threshold = 0 } = options;
  const callbacks: Set<IntersectionObserverCallback> = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const callback of callbacks) {
        callback(entries, observer);
      }
    },
    { root, rootMargin, threshold },
  );

  return {
    observer,
    getListeners() {
      return callbacks;
    },
    subscribe: (callback: IntersectionObserverCallback) => callbacks.add(callback),
    unsubscribe: (callback: IntersectionObserverCallback) => callbacks.delete(callback),
  };
}

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions,
): UseIntersectionObserverReturn {
  const { root = null, rootMargin = '0px', threshold = 0, freezeOnceVisible = false } = options;
  const [ref, setRef] = useState<Element | null>(null);
  const [state, setState] = useState<State>({ entry: null, isIntersecting: false });
  const observerRef = useRef<ReturnType<typeof createIntersectionObserver> | null>(null);

  const frozen = state.entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (frozen || ref == null) {
      return;
    }

    const instance = getIntersectionObserverInstance({ root, rootMargin, threshold });
    observerRef.current = instance;

    const handleIntersect: IntersectionObserverCallback = (entries, observer) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setState({ entry, isIntersecting: entry.isIntersecting });
      callback(entries, observer);
    };

    instance.subscribe(handleIntersect);
    instance.observer.observe(ref);

    return () => {
      instance.observer.unobserve(ref);
      instance.unsubscribe(handleIntersect);
    };
  }, [callback, frozen, ref, root, rootMargin, threshold]);

  return {
    ref: (node?: Element | null) => setRef(node ?? null),
    isIntersecting: state.isIntersecting,
    entry: state.entry,
  };
}
