import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { get as dotenvxGet } from '@dotenvx/dotenvx';

import { getS3Client } from './s3-client-instance';

// Execute the function at the module scope to avoid multiple decryptions.
const bucket = dotenvxGet('AWS_S3_BUCKET_NAME');

export const objectActions = {
  async upsertObject(params: { filename: string; body: Uint8Array }) {
    const client = await getS3Client();
    return client.send(new PutObjectCommand({ Bucket: bucket, Key: params.filename, Body: params.body }));
  },

  async readObjects(params: { limit: number; startingAfter?: string }) {
    const client = await getS3Client();
    return client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: params.startingAfter, MaxKeys: params.limit }),
    );
  },

  async deleteObject(params: { filename: string }) {
    const client = await getS3Client();
    return client.send(new DeleteObjectCommand({ Bucket: bucket, Key: params.filename }));
  },
};
