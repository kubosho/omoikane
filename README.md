# Blog image manager

Blog image manager for <https://blog.kubosho.com>.

## Setup

### Environment Variables

This project uses [dotenvx](https://dotenvx.com/) to manage encrypted environment variables. The `.env` file is encrypted and committed to the repository.

To run the application, you need the decryption key.

1. Obtain the `DOTENV_PRIVATE_KEY` from the project administrator.
2. Create a `.env.keys` file in the root directory, and add the key to the file:

```bash
DOTENV_PRIVATE_KEY="your_private_key_here"
```

### AWS Configuration

To manage AWS resources, you need to configure the AWS CLI profile and region. We recommend using [direnv](https://direnv.net/) to automatically load environment variables.

#### Option 1: Using direnv (Recommended)

Install `direnv` and create (or modify) `.envrc` in the project root:

```bash
export AWS_PROFILE="{YOUR_AWS_PROFILE}"
export AWS_DEFAULT_REGION="{YOUR_AWS_REGION}"
```

Allow the configuration:

```bash
direnv allow
```

#### Option 2: Manual Export

If you do not use direnv, you must manually export the variables before running Terraform or AWS commands:

```bash
export AWS_PROFILE="{YOUR_AWS_PROFILE}"
export AWS_DEFAULT_REGION="{YOUR_AWS_REGION}"
```

## Development

Start the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Lint the codes:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Launch storybook:

```bash
npm run storybook
```
