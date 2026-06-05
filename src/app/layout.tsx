import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Head Office | 3D Command Center',
  description: 'Virtual 3D Head Office Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#020617] text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
