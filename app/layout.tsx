import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Masters Fantasy Golf 2025',
  description: 'Pick your team for the 2025 Masters Tournament at Augusta National',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
