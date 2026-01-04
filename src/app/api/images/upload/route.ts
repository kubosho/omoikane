import { NextResponse } from 'next/server';

import type { UpsertImagesResponseObject } from '../../../../features/album/types/upsert-images';
import { auth } from '../../../../features/auth/auth';
import { objectActions } from '../../../../features/bucket/object-actions';

// Don't want to use let.
const imageData = new WeakMap<Request, Uint8Array>();

/**
 * Handles image upload.
 *
 * Q. Why not use FormData?
 * A. We avoid FormData to prevent forcing the client to generate it,
 *    allowing for pure JSON exchanges.
 */
export async function POST(request: Request): Promise<NextResponse<UpsertImagesResponseObject>> {
  const session = await auth();
  if (session?.user == null) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      { status: 401 },
    );
  }

  const contentType = request.headers.get('content-type');
  if (contentType == null) {
    return NextResponse.json(
      {
        message: 'Content-Type is missing.',
      },
      { status: 400 },
    );
  }
  if (!contentType.startsWith('image/')) {
    return NextResponse.json(
      {
        message: 'Invalid Content-Type. Only image file is allowed.',
      },
      { status: 415 },
    );
  }

  const buffer = await request.arrayBuffer().catch(() => new ArrayBuffer(0));
  if (buffer.byteLength === 0) {
    return NextResponse.json(
      {
        message: 'Uploaded file is empty.',
      },
      { status: 400 },
    );
  }

  imageData.set(request, new Uint8Array(buffer));

  const { searchParams } = new URL(request.url);
  const specifiedFilename = searchParams.get('filename');
  const imageFormat = contentType.split('/')[1];
  const filename = specifiedFilename ?? `${crypto.randomUUID()}.${imageFormat}`;

  try {
    await objectActions.upsertObject({
      filename,
      // Don't consider the absence of a request.
      body: imageData.get(request)!,
    });

    return NextResponse.json(
      {
        imagePath: filename,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: `Upload failed: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Upload failed due to an unknown error.',
      },
      { status: 500 },
    );
  }
}
