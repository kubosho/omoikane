import { FileUpload } from '@ark-ui/react/file-upload';
import type { Metadata } from 'next';

import { Error } from '../components/Error';
import { SiteHeader } from '../components/SiteHeader';
import { ERROR_REASON, ErrorReason } from '../constants/error-reason';
import { IMAGE_UPLOAD_LIMIT } from '../constants/image-upload-limit';
import { Images } from '../features/album/components/Images';
import { ImageUploadButton } from '../features/album/components/ImageUploadButton';
import { auth } from '../features/auth/auth';
import { SignInButton } from '../features/auth/components/SignInButton';
import { SESSION_EXPIRED_TIME_IN_SECONDS } from '../features/auth/session-expired-time';
import { fetchImageUrls } from '../features/bucket/image-url-fetcher';
import { TanstackQueryClientProvider } from '../lib/TanstackQueryClientProvider';

type Contents =
  | {
      imageUrls: never[];
      nextToken: null;
      isError: true;
      errorReason: ErrorReason;
    }
  | {
      imageUrls: string[];
      nextToken: string | null;
      isError: false;
      errorReason: null;
    };

export const metadata: Metadata = {
  title: 'Blog image manager',
};

async function getContents(): Promise<Contents> {
  const result = await fetchImageUrls({ limit: 20, secondsToExpire: SESSION_EXPIRED_TIME_IN_SECONDS });
  if ('urls' in result) {
    return {
      imageUrls: result.urls,
      nextToken: result.nextToken ?? null,
      isError: false,
      errorReason: null,
    };
  }

  return {
    imageUrls: [],
    nextToken: null,
    isError: true,
    errorReason: ERROR_REASON.GENERAL_ERROR,
  };
}

export default async function IndexPage(): Promise<React.JSX.Element> {
  const session = await auth();
  const { imageUrls, nextToken, isError, errorReason } = await getContents();

  if (isError) {
    return <Error errorReason={errorReason} />;
  }

  return (
    <div className="grid grid-rows-(--page-grid-row-value) h-dvh">
      <SiteHeader />
      <main>
        {session?.user == null && (
          <div className="flex items-center justify-center h-full">
            <div className="inline-flex flex-col border p-6 rounded-2 border-neutral-border">
              <h2 className="font-bold text-xl">Sign in required</h2>
              <p className="mt-2">Sign in to display the image.</p>
              <SignInButton className="flex justify-end mt-6" />
            </div>
          </div>
        )}
        {session?.user != null && (
          <TanstackQueryClientProvider>
            <div className={session?.user == null ? '' : 'grid grid-cols-[auto_1fr] gap-6 px-6 py-6'}>
              <ImageUploadButton />
              <FileUpload.Root accept="image/*" maxFiles={IMAGE_UPLOAD_LIMIT}>
                <FileUpload.HiddenInput />
                <Images imageUrls={imageUrls} nextToken={nextToken} />
              </FileUpload.Root>
            </div>
          </TanstackQueryClientProvider>
        )}
      </main>
    </div>
  );
}
