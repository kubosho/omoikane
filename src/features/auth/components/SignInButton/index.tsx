'use client';

import { handleSignIn } from '../../server-actions';

export function SignInButton(): React.JSX.Element {
  return (
    <form action={handleSignIn}>
      <button className="bg-primary-main border border-primary-sub px-3 py-1 rounded-1 text-monotone-100" type="submit">Sign in</button>
    </form>
  );
}
