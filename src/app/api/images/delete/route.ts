import { type NextRequest, NextResponse } from 'next/server';

import { objectActions } from '../../../../features/bucket/object-actions';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const filename = searchParams.get('filename');
  if (filename === '' || filename == null) {
    return NextResponse.json({ message: 'filename is required.' }, { status: 400 });
  }

  try {
    const result = await objectActions.deleteObject({ filename });
    if ('message' in result) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: `Delete failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Delete failed due to an unexpected error.' }, { status: 500 });
  }
}
