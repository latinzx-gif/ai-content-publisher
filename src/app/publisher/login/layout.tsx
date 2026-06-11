import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Content OS',
  description: 'Sign in to Content OS — AI-powered publishing pipeline.',
};

export default function PublisherLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols for login icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
