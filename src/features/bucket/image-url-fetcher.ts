import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { get as dotenvxGet } from '@dotenvx/dotenvx';

import type { GetImagesErrorResponseObject, GetImagesSuccessResponseObject } from '../album/types/get-images';
import { objectActions } from './object-actions';
import { getS3Client } from './s3-client-instance';

// Execute the function at the module scope to avoid multiple decryptions
const bucketName = dotenvxGet('AWS_S3_BUCKET_NAME');

async function fetchFileKeys(params: {
  limit: number;
  nextToken?: string;
}): Promise<{ keys: string[]; nextToken?: string }> {
  const response = await objectActions.readObjects({ limit: params.limit, startingAfter: params.nextToken });
  const keys = response.Contents?.flatMap((item) => (item.Key && !item.Key.endsWith('/') ? [item.Key] : [])) ?? [];

  return {
    keys,
    nextToken: response.NextContinuationToken,
  };
}

export async function fetchImageUrls(params: {
  limit: number;
  nextToken?: string;
  secondsToExpire: number;
}): Promise<GetImagesSuccessResponseObject | GetImagesErrorResponseObject> {
  const client = await getS3Client();

  const { keys, nextToken } = await fetchFileKeys({
    limit: params.limit,
    nextToken: params.nextToken,
  });

  const urls = await Promise.all(
    keys.map((key) => {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      return getSignedUrl(client, command, { expiresIn: params.secondsToExpire });
    }),
  );

  return {
    urls,
    nextToken: nextToken ?? null,
  };
}
