import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minimal Weather',
  description: 'Elegant animated weather experience'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
