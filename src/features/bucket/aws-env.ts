const AWS_ENV_KEYS = ['AWS_S3_BUCKET_NAME', 'COGNITO_IDENTITY_POOL_ID'] as const;

export type AwsEnv = Record<(typeof AWS_ENV_KEYS)[number], string>;

export function getAwsEnv(): AwsEnv {
  const processEnvKeySet = new Set(Object.keys(process.env));
  const hasAwsEnv = AWS_ENV_KEYS.every((key): key is keyof AwsEnv => processEnvKeySet.has(key));

  if (!hasAwsEnv) {
    throw new Error('Not set AWS environment variables');
  }

  const awsEnv = AWS_ENV_KEYS.reduce<AwsEnv>((acc, key) => {
    const value = process.env[key];

    return { ...acc, [key]: value };
  }, {} as AwsEnv);

  return awsEnv;
}
