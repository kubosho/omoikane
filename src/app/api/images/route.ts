import { NextResponse } from 'next/server';

import type { GetImagesResponseObject } from '../../../features/album/types/get-images';
import { auth } from '../../../features/auth/auth';
import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../../../features/auth/session-expired-time';
import { fetchImageUrls } from '../../../features/bucket/image-url-fetcher';

const DEFAULT_LIMIT = 20 as const;

export async function GET(request: Request): Promise<NextResponse<GetImagesResponseObject>> {
  const session = await auth();
  if (session?.user == null) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
    if (limit <= 0 || limit > 100) {
      return NextResponse.json(
        {
          message: 'Limit must be between 1 and 100.',
        },
        { status: 400 },
      );
    }

    const expiresIn = Number(searchParams.get('expiresIn')) || SESSION_EXPIRED_TIME_IN_SECONDS;
    if (expiresIn <= 0) {
      return NextResponse.json(
        {
          message: 'ExpiresIn must be greater than 0.',
        },
        { status: 400 },
      );
    }

    const nextToken = searchParams.get('nextToken') || undefined;

    const result = await fetchImageUrls({
      limit,
      nextToken,
      secondsToExpire: expiresIn,
    });
    if ('message' in result) {
      return NextResponse.json(
        {
          message: result.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        urls: result.urls,
        nextToken: result.nextToken,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: `Fetch failed: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Failed to fetch images due to an unexpected error.',
      },
      { status: 500 },
    );
  }
}
