import './globals.css';

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
