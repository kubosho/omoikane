'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { useIntersectionObserver } from '../../../../hooks/use-intersection-observer';
import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../../../auth/session-expired-time';
import { getImagesSuccessResponseSchema } from '../../utils/get-images-schema';
import { imagesQueryKey } from '../../utils/images-query-key';

type Props = {
  imageUrls: string[];
  nextToken: string | null;
};

async function fetchImages(params: {
  nextToken: string | null;
}): Promise<{ urls: string[]; nextToken: string | null }> {
  const imageRequestParams = new URLSearchParams({
    limit: '20',
    expiresIn: SESSION_EXPIRED_TIME_IN_SECONDS.toString(),
  });

  if (params?.nextToken != null && params.nextToken !== '') {
    imageRequestParams.set('nextToken', params.nextToken);
  }

  const response = await fetch(`/api/images?${imageRequestParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch images.');
  }

  const result = getImagesSuccessResponseSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error('Invalid response type from server.');
  }

  return {
    urls: result.data.urls,
    nextToken: result.data.nextToken,
  };
}

export function Images({ imageUrls: initialImageUrls, nextToken }: Props): React.JSX.Element {
  const previousImagesCountRef = useRef(0);
  const fetchedImagesCountRef = useRef(0);

  // Fetch images with infinite scrolling
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: imagesQueryKey,
    queryFn: ({ pageParam }) => fetchImages({ nextToken: pageParam?.nextToken }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextToken) {
        return null;
      }

      return { nextToken: lastPage.nextToken };
    },
    initialData: {
      pages: [{ urls: initialImageUrls, nextToken: nextToken }],
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
        void fetchNextPage();
      }
    },
    {
      rootMargin: '100px',
      threshold: 0,
    },
  );

  const allImageUrls = data?.pages.flatMap((page) => page.urls) ?? initialImageUrls;
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
    <div>
      <p className="sr-only" aria-live="polite">
        {isFetching ? 'Loading images...' : `${fetchedImagesCountRef.current} images loaded.`}
      </p>
      <ul className="grid grid-cols-4 gap-6">
        {imageData.map(({ name, url }, index) => (
          <li key={index}>
            <img
              src={url}
              alt=""
              width="auto"
              height="300"
              className="object-contain justify-self-center h-75 shadow-md"
            />
            <p className="mt-1">{name}</p>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <p ref={ref} className="text-center">
          {isFetching ? 'Loading images...' : 'Scroll down to load more images'}
        </p>
      )}
    </div>
  );
}
