jest.unstable_mockModule('@aws-sdk/credential-providers', () => ({
  fromCognitoIdentityPool: jest.fn(),
}));

jest.unstable_mockModule('@dotenvx/dotenvx', () => ({
  get: jest.fn((key: string) => process.env[key]),
}));

jest.unstable_mockModule('../auth/auth', () => ({
  auth: jest.fn(),
}));

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Session } from 'next-auth';

describe('S3 Client Instance', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AUTH_COGNITO_ISSUER = 'https://cognito-idp.ap-northeast-1.amazonaws.com/test-pool-id';
    process.env.COGNITO_IDENTITY_POOL_ID = 'test-identity-pool-id';
    process.env.AWS_REGION_NAME = 'ap-northeast-1';
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
      token: 'valid-id-token',
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

  it('throws at module load when AUTH_COGNITO_ISSUER is missing', async () => {
    // Arrange
    process.env.AUTH_COGNITO_ISSUER = '';

    // Act & Assert
    await expect(import('./s3-client-instance')).rejects.toThrow(
      'AUTH_COGNITO_ISSUER environment variable is not set',
    );
  });

  it('throws at module load when COGNITO_IDENTITY_POOL_ID is missing', async () => {
    // Arrange
    delete process.env.COGNITO_IDENTITY_POOL_ID;

    // Act & Assert
    await expect(import('./s3-client-instance')).rejects.toThrow(
      'COGNITO_IDENTITY_POOL_ID environment variable is not set',
    );
  });

  it('throws at module load when AWS_REGION_NAME is missing', async () => {
    // Arrange
    process.env.AWS_REGION_NAME = '';

    // Act & Assert
    await expect(import('./s3-client-instance')).rejects.toThrow(
      'AWS_REGION_NAME environment variable is not set',
    );
  });
});
