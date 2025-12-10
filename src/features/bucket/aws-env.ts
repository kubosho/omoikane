import { ERROR_REASON } from '../../constants/error-reason';

const AWS_ENV_KEYS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'] as const;

export type AwsEnv = Record<(typeof AWS_ENV_KEYS)[number], string>;

export function getAwsEnv(): AwsEnv {
  const processEnvKeySet = new Set(Object.keys(process.env));
  const hasAwsEnv = AWS_ENV_KEYS.every((key): key is keyof AwsEnv => processEnvKeySet.has(key));

  if (!hasAwsEnv) {
    throw new Error(ERROR_REASON.NOT_SET_AWS_ENVIRONMENT_VARIABLES);
  }

  const awsEnv = AWS_ENV_KEYS.reduce<AwsEnv>((acc, key) => {
    const value = process.env[key];

    return { ...acc, [key]: value };
  }, {} as AwsEnv);

  return awsEnv;
}
