'use client';

import { handleSignOut } from '../../server-actions';

export function SignOutButton(): React.JSX.Element {
  return (
    <form action={handleSignOut}>
      <button className="bg-primary-main border border-primary-sub px-3 py-1 rounded-1 text-monotone-100" type="submit">Sign out</button>
    </form>
  );
}
