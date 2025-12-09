import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3Client } from './s3-client-instance';

export async function getObjectPresignedUrl({
  filename,
  expiresIn,
}: {
  filename: string;
  expiresIn: number;
}): Promise<string> {
  const client = await getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
  });

  return getSignedUrl(client, command, { expiresIn });
}
