import { get as dotenvxGet } from '@dotenvx/dotenvx';
import type { Account, Session } from 'next-auth';
import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Cognito from 'next-auth/providers/cognito';

// Extend Session type to include idToken
declare module 'next-auth' {
  interface Session {
    idToken?: string;
  }
}

// Extend JWT type to include idToken
declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
  }
}

type Provider = {
  id: string;
  name: string;
};

export const providers: Provider[] = [
  {
    id: 'cognito',
    name: 'Cognito',
  },
];

const allowedEmails =
  dotenvxGet('ALLOWED_EMAILS')
    ?.split(',')
    .map((email) => email.trim()) ?? [];

const config = {
  providers: [
    Cognito({
      clientId: dotenvxGet('AUTH_COGNITO_ID'),
      clientSecret: dotenvxGet('AUTH_COGNITO_SECRET'),
      issuer: dotenvxGet('AUTH_COGNITO_ISSUER'),
      authorization: {
        params: {
          identity_provider: 'Google',
          scope: 'email openid',
        },
      },
      /**
       * "nonce" check is required, because Cognito always returns a nonce in the ID token.
       * If this check is missing, NextAuth throws a "CallbackRouteError" (unexpected ID Token "nonce" claim value)
       * and fails before it can reach the signIn callback to handle access control.
       */
      checks: ['nonce', 'pkce'],
    }),
  ],
  pages: {
    error: '/',
  },
  callbacks: {
    signIn({ user }: { user: { email?: string | null } }) {
      if (user.email == null || user.email === '') {
        return false;
      }

      // AllowedEmails is empty, access is denied by default.
      if (allowedEmails.length === 0) {
        console.warn('[auth] ALLOWED_EMAILS is empty: denying access to all users. Check environment configuration.');

        return false;
      }

      return allowedEmails.includes(user.email);
    },
    jwt({ token, account }: { token: JWT; account?: Account | null }) {
      // Save ID token from Cognito on initial sign-in
      if (account?.id_token != null && account.id_token !== '') {
        token.idToken = account.id_token;
      }

      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      // Expose ID token to the session for server-side use
      if (token.idToken != null && token.idToken !== '') {
        session.idToken = token.idToken;
      }

      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
