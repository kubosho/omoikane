import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('S3 Client Instance', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should create a new S3 client instance', async () => {
    const { s3ClientInstance } = await import('./s3-client-instance');
    const client = s3ClientInstance();
    expect(client).toBeDefined();
  });

  it('should return the same instance on subsequent calls', async () => {
    const { s3ClientInstance } = await import('./s3-client-instance');
    const client1 = s3ClientInstance();
    const client2 = s3ClientInstance();
    expect(client1).toBe(client2);
  });
});
