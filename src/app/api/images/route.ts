import { NextRequest, NextResponse } from 'next/server';

import type { GetImagesErrorResponseObject, GetImagesSuccessResponseObject } from '../../../features/album/types/get-images';
import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../../../features/auth/session-expired-time';
import { fetchImageUrls } from '../../../features/bucket/image-url-fetcher';

const DEFAULT_LIMIT = 20 as const;

export async function GET(request: NextRequest): Promise<
  | NextResponse<GetImagesSuccessResponseObject>
  | NextResponse<GetImagesErrorResponseObject>
> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
    const nextToken = searchParams.get('nextToken') || undefined;
    const expiresIn = Number(searchParams.get('expiresIn')) || SESSION_EXPIRED_TIME_IN_SECONDS;

    if (limit <= 0 || limit > 100) {
      return NextResponse.json(
        {
          message: 'Limit must be between 1 and 100.',
        },
        { status: 400 },
      );
    }

    if (expiresIn <= 0) {
      return NextResponse.json(
        {
          message: 'ExpiresIn must be greater than 0.',
        },
        { status: 400 },
      );
    }

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
    console.error('Failed to fetch image URLs:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch images.',
      },
      { status: 500 },
    );
  }
}
