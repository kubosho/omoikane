'use server';

import type { ProviderId } from 'next-auth/providers';

import { signIn, signOut } from './auth';

export async function handleSignIn(providerId: ProviderId): Promise<string> {
  return (await signIn(providerId, { redirect: false })) as string;
}

export async function handleSignOut(): Promise<void> {
  await signOut();
}
