import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { get as dotenvxGet } from '@dotenvx/dotenvx';

import { auth } from '../auth/auth';

// Execute the function at the module scope to avoid multiple decryptions
const issuer = dotenvxGet('AUTH_COGNITO_ISSUER');
const userPoolId = issuer?.split('/').pop();
const identityPoolId = dotenvxGet('COGNITO_IDENTITY_POOL_ID');
const region = dotenvxGet('AWS_REGION_NAME');

// Fail fast at module load rather than on every request
if (userPoolId == null || userPoolId === '') {
  throw new Error('AUTH_COGNITO_ISSUER environment variable is not set');
}
if (identityPoolId == null || identityPoolId === '') {
  throw new Error('COGNITO_IDENTITY_POOL_ID environment variable is not set');
}
if (region == null || region === '') {
  throw new Error('AWS_REGION_NAME environment variable is not set');
}

const providerName = `cognito-idp.${region}.amazonaws.com/${userPoolId}`;

export async function getS3Client(): Promise<S3Client> {
  const session = await auth();

  if (session == null || session.token == null) {
    throw new Error('No authenticated session or ID token available');
  }

  return new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
      identityPoolId,
      clientConfig: { region },
      logins: {
        [providerName]: session.token,
      },
    }),
  });
}
