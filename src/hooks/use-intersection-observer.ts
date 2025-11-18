'use client';

import { useEffect, useRef, useState } from 'react';

type State = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};

/**
 * Options to configure the `useIntersectionObserver` hook.
 *
 * @property root - The element that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.
 * @property rootMargin - Margin around the root. Can have values similar to the CSS margin property (e.g., "10px 20px 30px 40px" or "10%").
 * @property threshold - A single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be executed.
 * @property freezeOnceVisible - If true, stops observing once the target is visible.
 */
type UseIntersectionObserverOptions = {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
};

/**
 * The return type of the `useIntersectionObserver` hook.
 *
 * @property entry - The latest IntersectionObserverEntry observed.
 * @property isIntersecting - A boolean indicating if the target is intersecting.
 * @property ref - A ref callback to be assigned to the target element.
 */
type UseIntersectionObserverReturn = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
  ref: (node?: Element | null) => void;
};

const ROOT_SENTINEL = {} as HTMLElement;

const intersectionObserver = new WeakMap<HTMLElement, Record<string, ReturnType<typeof createIntersectionObserver>>>();
function getIntersectionObserverInstance(options: UseIntersectionObserverOptions) {
  const { root, ...keys } = options;
  const cacheKey = JSON.stringify(keys);
  const weakMapKey = root ?? ROOT_SENTINEL;

  let base = intersectionObserver.get(weakMapKey);
  if (base == null) {
    base = {};
    intersectionObserver.set(weakMapKey, base);
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

/**
 * A React hook that uses the Intersection Observer API to monitor the visibility of a target element.
 *
 * @param callback - The callback function to be executed when intersection changes.
 * @param options - Options to configure the useIntersectionObserver.
 * @returns {UseIntersectionObserverReturn} An object containing the ref callback, isIntersecting boolean, and the latest entry.
 */
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
