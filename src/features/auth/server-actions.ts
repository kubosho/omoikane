'use server';

import type { ProviderId } from 'next-auth/providers';

import { signIn, signOut } from './auth';

export async function handleSignIn(providerId: ProviderId) {
  await signIn(providerId);
}

export async function handleSignOut() {
  await signOut();
}
