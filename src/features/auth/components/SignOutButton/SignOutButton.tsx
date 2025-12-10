'use client';

import { handleSignOut } from '../../server-actions';

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props): React.JSX.Element {
  return (
    <form action={handleSignOut} className={className}>
      <button className="bg-primary-main border border-primary-sub px-4 py-1 rounded-1 text-monotone-100" type="submit">
        Sign out
      </button>
    </form>
  );
}
