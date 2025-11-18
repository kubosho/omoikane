# Blog image manager

Blog image manager for <https://blog.kubosho.com>.

## Setup

### Environment Variables

To develop locally, create a `.env` file by copying `.env.template`:

```bash
cp .env.template .env
```

Then update each environment variable with your AWS credentials and configuration:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_HOST_NAME=s3.amazonaws.com
AWS_S3_REGION_NAME=ap-northeast-1
AWS_CLOUD_FRONT_HOST_NAME=example.cloudfront.net
```

## Development

Launch development server:

```bash
npm run dev
```

Execute build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Run test runner:

```bash
npm run test
```

Launch storybook:

```bash
npm run storybook
```
