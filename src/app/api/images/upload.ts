import { NextResponse } from 'next/server';

import { objectActions } from '../../../features/bucket/object-actions';

export async function POST(request: Request): Promise<
  | NextResponse<{
      message: string;
      uploaded: never[];
    }>
  | NextResponse<{
      message: null;
      uploaded: string[];
    }>
> {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return NextResponse.json(
      {
        message: 'No files provided.',
        uploaded: [],
      },
      { status: 400 },
    );
  }

  try {
    const fileEntries = await Promise.all(
      files.map(async (file) => {
        const key = `${crypto.randomUUID()}-${file.name}`;
        const value = await file.arrayBuffer();

        return {
          key,
          value: new Uint8Array(value),
        };
      }),
    );

    const uploads = await Promise.all(
      fileEntries.map(async ({ key, value }) => {
        await objectActions.upsertObject({
          filename: key,
          body: value,
        });

        return key;
      }),
    );

    return NextResponse.json(
      {
        message: null,
        uploaded: uploads,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: 'Upload failed.',
        uploaded: [],
      },
      { status: 500 },
    );
  }
}
