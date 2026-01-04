import { auth } from '../../../../features/auth/auth';
import { objectActions } from '../../../../features/bucket/object-actions';

export async function DELETE(request: Request): Promise<Response> {
  const session = await auth();
  if (session?.user == null) {
    return Response.json(
      {
        message: 'Unauthorized',
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);

  const filename = searchParams.get('filename');
  if (filename === '' || filename == null) {
    return Response.json(
      {
        message: 'filename is required.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await objectActions.deleteObject({ filename });
    if ('message' in result) {
      return Response.json(
        {
          message: result.message,
        },
        { status: 500 },
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        {
          message: `Delete failed: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        message: 'Delete failed due to an unexpected error.',
      },
      { status: 500 },
    );
  }
}
