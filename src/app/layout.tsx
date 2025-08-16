// optifuse/client/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import './global.css';

export const metadata: Metadata = {
  title: 'Optifuse',
  description: 'Optimize your serverless applications.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Simple Header for Navigation */}
        <header className="border-b">
          <nav className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="font-bold text-lg">
              Optifuse
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary">
                Settings
              </Link>
            </div>
          </nav>
        </header>
        
        {/* Page content will be rendered here */}
        <main>{children}</main>
      </body>
    </html>
  );
}