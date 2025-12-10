import type { NextConfig } from 'next';

const bucketHostname = 's3.amazonaws.com' as const;
const bucketName = process.env.CI ? 'test-bucket' : process.env.AWS_S3_BUCKET_NAME;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`https://${bucketName}.${bucketHostname}/**`)],
  },
};

export default nextConfig;
