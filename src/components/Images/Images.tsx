'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../../features/auth/session-expired-time';
import { useIntersectionObserver } from '../../hooks/use-intersection-observer';

type Props = {
  imageUrls: string[];
  nextToken: string | null;
};

export function Images({ imageUrls, nextToken }: Props): React.JSX.Element {
  const previousImagesCountRef = useRef(0);
  const fetchedImagesCountRef = useRef(0);

  // Fetch images with infinite scrolling
  const { data, fetchNextPage, hasNextPage, isFetching, isFetched } = useInfiniteQuery({
    queryKey: ['images'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: '20',
        expiresIn: SESSION_EXPIRED_TIME_IN_SECONDS.toString(),
      });

      if (pageParam?.nextToken != null && pageParam.nextToken !== '') {
        params.set('nextToken', pageParam.nextToken);
      }

      const response = await fetch(`/api/images?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();

      return {
        urls: data.urls,
        nextToken: data.nextToken,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextToken) {
        return null;
      }

      return { nextToken: lastPage.nextToken };
    },
    initialData: {
      pages: [{ urls: imageUrls, nextToken: nextToken }],
      pageParams: [{ nextToken: null }],
    },
    initialPageParam: { nextToken: null } as { nextToken: string | null },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  // Set up intersection observer to load more images when scrolling
  const { ref } = useIntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    {
      rootMargin: '100px',
      threshold: 0,
    },
  );

  const allImageUrls = data?.pages.flatMap((page) => page.urls) ?? imageUrls;
  const imageData = allImageUrls.map((imageUrl) => {
    const url = new URL(imageUrl);
    const name = url.pathname.slice(1);

    return {
      name: decodeURI(name),
      url: imageUrl,
    };
  });
  const imagesCount = imageData.length;

  if (isFetching) {
    fetchedImagesCountRef.current = 0;
  }

  if (previousImagesCountRef.current === 0) {
    // Initial load
    previousImagesCountRef.current = imagesCount;
  } else if (!isFetching && previousImagesCountRef.current !== imagesCount) {
    // After fetching new images
    fetchedImagesCountRef.current = imagesCount - previousImagesCountRef.current;
    previousImagesCountRef.current = imagesCount;
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {isFetching ? 'Loading images...' : `${fetchedImagesCountRef.current} images loaded.`}
      </p>
      <ul className="grid grid-cols-4 gap-6 px-6 py-6">
        {imageData.map(({ name, url }, index) => (
          <li key={index}>
            <img src={url} alt="" width="auto" height="300" className="object-contain justify-self-center h-75 shadow-md" />
            <p className="mt-1">{name}</p>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <p ref={ref} className="text-center">
          {isFetching ? 'Loading images...' : 'Scroll down to load more images'}
        </p>
      )}
    </>
  );
}
