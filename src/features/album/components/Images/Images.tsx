'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

import { useIntersectionObserver } from '../../../../hooks/use-intersection-observer';
import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../../../auth/session-expired-time';
import { getImagesSuccessResponseSchema } from '../../utils/get-images-schema';
import { imagesQueryKey } from '../../utils/images-query-key';
import { TrashButton } from '../TrashButton';
import styles from './images.module.css';

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

const ImagesLoadingAnnouncer = dynamic(
  () => import('../ImagesLoadingAnnouncer').then(({ ImagesLoadingAnnouncer }) => ImagesLoadingAnnouncer),
  { ssr: false },
);

export function Images(): React.JSX.Element {
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

  const allImageUrls = data?.pages.flatMap((page) => page.urls);
  const imageData = allImageUrls?.map((imageUrl) => {
    const url = new URL(imageUrl);
    const name = url.pathname.slice(1);

    return {
      name: decodeURI(name),
      url: imageUrl,
    };
  });
  const imagesCount = imageData?.length ?? 0;

  if (isFetching) {
    fetchedImagesCountRef.current = 0;
  }

  if (previousImagesCountRef.current === 0) {
    // Initial load
    fetchedImagesCountRef.current = imagesCount;
    previousImagesCountRef.current = imagesCount;
  } else if (!isFetching && previousImagesCountRef.current !== imagesCount) {
    // After fetching new images
    fetchedImagesCountRef.current = imagesCount - previousImagesCountRef.current;
    previousImagesCountRef.current = imagesCount;
  }

  return (
    <div>
      <ImagesLoadingAnnouncer isFetching={isFetching} fetchedImagesCount={fetchedImagesCountRef.current} />
      <ul className={styles.imageItems}>
        {imageData?.map(({ name, url }, index) => (
          <li key={index} className={styles.imageItem}>
            <button type="button" className={styles.imageAction}>
              <img src={url} alt="" width="auto" height="300" className={styles.image} />
              <span className="sr-only">Show actions for {name}</span>
            </button>
            <div className={styles.imageContextPanel}>
              <div className={styles.imageMeta}>
                <p>{name}</p>
              </div>
              <div className={styles.imageControls}>
                <TrashButton filename={name} />
              </div>
            </div>
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
