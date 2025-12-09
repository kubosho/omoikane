import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Session } from 'next-auth';

// Hoist mock for ESM compatibility.
jest.unstable_mockModule('../auth/auth', () => ({
  auth: jest.fn(),
}));

jest.unstable_mockModule('@aws-sdk/credential-providers', () => ({
  fromCognitoIdentityPool: jest.fn(),
}));

describe('S3 Client Instance', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AUTH_COGNITO_ISSUER = 'https://cognito-idp.ap-northeast-1.amazonaws.com/test-pool-id';
    process.env.COGNITO_IDENTITY_POOL_ID = 'test-identity-pool-id';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should create a new S3 client instance', async () => {
    // Arrange
    const { auth } = await import('../auth/auth');
    const mockAuth = auth as unknown as jest.MockedFunction<() => Promise<Session | null>>;

    mockAuth.mockResolvedValue({
      user: { email: 'test@example.com' },
      idToken: 'valid-id-token',
      expires: '2099-01-01',
    });

    // Act
    const { getS3Client } = await import('./s3-client-instance');
    const client = await getS3Client();

    // Assert
    expect(client).toBeDefined();
  });

  it('should throw error if idToken is missing', async () => {
    // Arrange
    const { auth } = await import('../auth/auth');
    const mockAuth = auth as unknown as jest.MockedFunction<() => Promise<Session | null>>;
    mockAuth.mockResolvedValue(null);

    // Act
    const { getS3Client } = await import('./s3-client-instance');

    // Assert
    await expect(getS3Client()).rejects.toThrow('No authenticated session or ID token available');
  });
});
