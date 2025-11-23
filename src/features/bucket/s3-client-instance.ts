import { S3Client } from '@aws-sdk/client-s3';

import { getAwsEnv } from './aws-env';

const REGION = 'ap-northeast-1' as const;

let instance: S3Client | null = null;
export const s3ClientInstance = (): S3Client => {
  if (instance == null) {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = getAwsEnv();

    instance = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return instance;
};
