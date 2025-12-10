import './globals.css';

import type { Metadata, Viewport } from 'next';

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#003760',
};

export default function RootLayout({ children }: Props): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
