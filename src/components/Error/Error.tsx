import { ReactNode } from 'react';

import { ERROR_REASON, ErrorReason } from '../../constants/error_reason';
import { SiteHeader } from '../SiteHeader';

type Props = {
  errorReason: ErrorReason;
};

function ErrorContainer({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <div className="absolute top-5 left-2/4 -translate-x-1/2">{children}</div>
      </main>
    </>
  );
}

export function Error({ errorReason }: Props): React.JSX.Element {
  switch (errorReason) {
    case ERROR_REASON.NOT_SET_AWS_ENVIRONMENT_VARIABLES:
      return (
        <ErrorContainer>
          <p>Environment variable for AWS is not set.</p>
          <p>Please set environment variables in the .env file.</p>
        </ErrorContainer>
      );
    default:
      return (
        <ErrorContainer>
          <p>Something went wrong.</p>
        </ErrorContainer>
      );
  }
}
