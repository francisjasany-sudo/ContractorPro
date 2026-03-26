import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContractorPro',
  description: 'All-in-one app for contractors: estimates, proposals, project management, invoicing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
