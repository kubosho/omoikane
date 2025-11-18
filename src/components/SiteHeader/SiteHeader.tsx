import Image from 'next/image';
import Link from 'next/link';

import { auth } from '../../features/auth/auth';
import { SignInButton } from '../../features/auth/components/SignInButton';
import { SignOutButton } from '../../features/auth/components/SignOutButton';

export const SiteHeader = async (): Promise<React.JSX.Element> => {
  const session = await auth();

  return (
    <header className="bg-primary-main flex items-center justify-between p-4">
      <h1 className="text-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-white">
          <Image src="/images/icons/learn.svg" alt="" width={32} height={24} />
          Blog image manager
        </Link>
      </h1>
      {session?.user != null ? <SignOutButton /> : <SignInButton />}
    </header>
  );
};
