import Image from 'next/image';
import Link from 'next/link';

import { auth } from '../../features/auth/auth';
import { SignInButton } from '../../features/auth/components/SignInButton';
import { SignOutButton } from '../../features/auth/components/SignOutButton';
import styles from './SiteHeader.module.css';

export const SiteHeader = async (): Promise<React.JSX.Element> => {
  const session = await auth();

  return (
    <header className={`${styles.header} flex items-center justify-between p-4`}>
      <h1 className={`${styles.headings} text-2xl`}>
        <Link href="/" className="inline-flex items-center gap-2 text-monotone-100">
          <Image src="/images/icons/learn.svg" alt="" width={32} height={24} />
          omoikane
        </Link>
      </h1>
      {session?.user != null ? <SignOutButton /> : <SignInButton />}
    </header>
  );
};
