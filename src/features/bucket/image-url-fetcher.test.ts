// Decouple from S3 Client implementation.
jest.unstable_mockModule('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockImplementation((_client: unknown, command: unknown) => {
    // Simulate signed URL.
    const cmd = command as GetObjectCommand;
    const key = cmd.input.Key ?? 'unknown-key';
    return Promise.resolve(
      `https://test-bucket.s3.ap-northeast-1.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=mock-signature`,
    );
  }),
}));

jest.unstable_mockModule('@dotenvx/dotenvx', () => ({
  get: jest.fn((key: string) => process.env[key]),
}));

// Prevent 'next-auth' execution side-effects.
jest.unstable_mockModule('./s3-client-instance', () => ({
  getS3Client: jest.fn<() => Promise<S3Client>>().mockResolvedValue({
    config: {},
    middlewareStack: jest.fn(),
    destroy: jest.fn(),
    send: jest.fn(),
  } as unknown as S3Client),
}));

import { GetObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { GetImagesErrorResponseObject, GetImagesSuccessResponseObject } from '../album/types/get-images';

const { fetchImageUrls } = await import('./image-url-fetcher');
const { objectActions } = await import('./object-actions');

const createFakeS3ServiceException = (message: string): S3ServiceException =>
  new S3ServiceException({
    name: 'S3ServiceException',
    $fault: 'client',
    $metadata: {},
    message,
  });

describe('fetchImageUrls', () => {
  const ORIGINAL_ENV = process.env;

  beforeAll(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns signed image URLs when S3 objects are available', async () => {
    // Arrange
    jest.spyOn(objectActions, 'readObjects').mockResolvedValue({
      Contents: [{ Key: 'images/' }, { Key: 'image-a.png' }, { Key: 'image-b.jpg' }, { Key: undefined }],
      $metadata: {},
    });

    // Act
    const result = (await fetchImageUrls({ limit: 3, secondsToExpire: 600 })) as GetImagesSuccessResponseObject;

    // Assert
    expect(result.urls).toHaveLength(2);
    expect(result.urls[0]).toMatch(
      /^https:\/\/test-bucket\.s3\.[^/]+\.amazonaws\.com\/image-a\.png\?.*X-Amz-Algorithm=.*&.*X-Amz-Signature=/,
    );
    expect(result.urls[1]).toMatch(
      /^https:\/\/test-bucket\.s3\.[^/]+\.amazonaws\.com\/image-b\.jpg\?.*X-Amz-Algorithm=.*&.*X-Amz-Signature=/,
    );
  });

  it('returns an error message when an S3ServiceException occurs', async () => {
    // Arrange
    const s3Error = createFakeS3ServiceException('S3 failure');
    jest.spyOn(objectActions, 'readObjects').mockImplementation(() => {
      throw s3Error;
    });

    // Act
    const result = (await fetchImageUrls({ limit: 2, secondsToExpire: 120 })) as GetImagesErrorResponseObject;

    // Assert
    expect(result.message).toContain('Failed to fetch file keys: S3 failure');
  });

  it('returns an error message when an unexpected error occurs', async () => {
    // Arrange
    const unexpectedError = new Error('Unexpected failure');
    jest.spyOn(objectActions, 'readObjects').mockRejectedValue(unexpectedError);

    // Act
    const result = (await fetchImageUrls({ limit: 5, secondsToExpire: 300 })) as GetImagesErrorResponseObject;

    // Assert
    expect(result.message).toBe('Unexpected S3 error while fetching file keys');
  });
});
