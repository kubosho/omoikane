import { get as dotenvxGet } from '@dotenvx/dotenvx';
import type { Account, Session } from 'next-auth';
import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Cognito from 'next-auth/providers/cognito';

import { cognitoTokensSchema } from './utils/cognito-tokens-schema';

// Execute the function at the module scope to avoid multiple decryptions
const allowedEmails = dotenvxGet('ALLOWED_EMAILS');
const clientId = dotenvxGet('AUTH_COGNITO_ID');
const clientSecret = dotenvxGet('AUTH_COGNITO_SECRET');
const issuer = dotenvxGet('AUTH_COGNITO_ISSUER');
const region = dotenvxGet('AWS_REGION_NAME');

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshTokenError';
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    expires_at?: number;
    error?: 'RefreshTokenError';
    id_token?: string;
    refresh_token?: string;
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

const TOKEN_END_POINT = `https://omoikane.auth.${region}.amazoncognito.com/oauth2/token`;

const config = {
  providers: [
    Cognito({
      clientId,
      clientSecret,
      issuer,
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

      const emails = allowedEmails?.split(',').map((email) => email.trim()) ?? [];
      // AllowedEmails is empty, access is denied by default.
      if (emails.length === 0) {
        console.warn('[auth] ALLOWED_EMAILS is empty: denying access to all users. Check environment configuration.');

        return false;
      }

      return emails.includes(user.email);
    },
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
      // Save ID token from Cognito on initial sign-in
      if (account != null) {
        return {
          ...token,
          access_token: account.access_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };
      } else if (Date.now() < (token.expires_at ?? 0) * 1000) {
        return token;
      } else {
        if (token.refresh_token == null || token.refresh_token === '') {
          throw new TypeError('Missing refresh_token');
        }

        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch(TOKEN_END_POINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token,
          }),
        });

        const result = cognitoTokensSchema.safeParse(await response.json());
        if (!result.success) {
          console.error('Error refreshing access_token:', result.error);
          token.error = 'RefreshTokenError';
          return token;
        }

        const newToken = result.data;
        return {
          ...token,
          access_token: newToken.access_token,
          id_token: newToken.id_token,
          expires_at: Math.floor(Date.now() / 1000 + newToken.expires_in),
          refresh_token: token.refresh_token,
        };
      }
    },
    session({ session, token }: { session: Session; token: JWT }) {
      // Expose ID token to the session for server-side use
      if (token.id_token != null && token.id_token !== '') {
        session.token = token.id_token;
      }

      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
