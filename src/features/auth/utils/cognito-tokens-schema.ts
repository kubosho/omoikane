import * as z from 'zod/mini';

export const cognitoTokensSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  id_token: z.string(),
  token_type: z.string(),
});
