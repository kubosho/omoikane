import {
  DeleteObjectCommand,
  type DeleteObjectCommandOutput,
  GetObjectCommand,
  type GetObjectCommandOutput,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  type PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { get as dotenvxGet } from '@dotenvx/dotenvx';

import { getS3Client } from './s3-client-instance';

interface ObjectActions {
  upsertObject: (params: { filename: string; body: Uint8Array }) => Promise<PutObjectCommandOutput>;
  readObject: (params: { filename: string }) => Promise<GetObjectCommandOutput>;
  readObjects: (params: { limit: number; startingAfter?: string }) => Promise<ListObjectsV2CommandOutput>;
  deleteObject: (params: { filename: string }) => Promise<DeleteObjectCommandOutput>;
}

// Execute the function at the module scope to avoid multiple decryptions.
const bucket = dotenvxGet('AWS_S3_BUCKET_NAME');

class S3ObjectActions implements ObjectActions {
  async upsertObject(params: { filename: string; body: Uint8Array }): Promise<PutObjectCommandOutput> {
    const { filename, body } = params;
    const client = await getS3Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: body,
    });

    const data = await client.send(command);
    return data;
  }

  async readObject(params: { filename: string }): Promise<GetObjectCommandOutput> {
    const { filename } = params;
    const client = await getS3Client();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    const data = await client.send(command);
    return data;
  }

  async readObjects(params: { limit: number; startingAfter?: string }): Promise<ListObjectsV2CommandOutput> {
    const { limit, startingAfter } = params;
    const client = await getS3Client();

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: startingAfter,
      MaxKeys: limit,
    });

    const data = await client.send(command);
    return data;
  }

  async deleteObject(params: { filename: string }): Promise<DeleteObjectCommandOutput> {
    const { filename } = params;
    const client = await getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    const data = await client.send(command);
    return data;
  }
}

export const objectActions: ObjectActions = new S3ObjectActions();
