import { FileUpload } from '@ark-ui/react/file-upload';
import type { Metadata } from 'next';

import { SiteHeader } from '../components/SiteHeader';
import { IMAGE_UPLOAD_LIMIT } from '../constants/image-upload-limit';
import { Images } from '../features/album/components/Images';
import { ImageUploadButton } from '../features/album/components/ImageUploadButton';
import { auth } from '../features/auth/auth';
import { SignInButton } from '../features/auth/components/SignInButton';
import { TanstackQueryClientProvider } from '../lib/TanstackQueryClientProvider';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. Please sign in with an allowed account.',
  Verification: 'The verification of the authentication token failed.',
  Default: 'An error occurred during authentication.',
};

export const metadata: Metadata = {
  title: 'omoikane',
};

export default async function IndexPage(props: Props): Promise<React.JSX.Element> {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  const session = await auth();

  let errorMessage = '';
  if (error != null) {
    const errorType = typeof error === 'string' ? error : error[0];
    errorMessage = errorMessages[errorType] ?? errorMessages.Default;
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-dvh">
      <SiteHeader />
      <main>
        {session?.user == null && (
          <div className="flex items-center justify-center h-full">
            <div className="inline-flex flex-col border p-6 rounded-2 border-neutral-border">
              {errorMessage ? (
                <>
                  <h2 className="font-bold text-xl text-red-600">Authentication Error</h2>
                  <p className="mt-2">{errorMessage}</p>
                </>
              ) : (
                <>
                  <h2 className="font-bold text-xl">Sign in required</h2>
                  <p className="mt-2">Sign in to display the image.</p>
                </>
              )}
              <SignInButton className="flex justify-end mt-6" />
            </div>
          </div>
        )}
        {session?.user != null && (
          <TanstackQueryClientProvider>
            <div className={session?.user == null ? '' : 'flex flex-wrap gap-6 px-6 py-6'}>
              <div className="shrink-0">
                <ImageUploadButton />
              </div>
              <FileUpload.Root accept="image/*" maxFiles={IMAGE_UPLOAD_LIMIT} className="flex-1">
                <FileUpload.HiddenInput />
                <Images />
              </FileUpload.Root>
            </div>
          </TanstackQueryClientProvider>
        )}
      </main>
    </div>
  );
}
