import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

type Provider = {
  id: string;
  name: string;
};

export const providers: Provider[] = [
  {
    id: 'google',
    name: 'Google',
  },
];

const config = {
  providers: [Google],
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
