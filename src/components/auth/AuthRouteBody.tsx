'use client';

import { useEffect } from 'react';

type AuthRouteBodyProps = {
  variant: 'publisher' | 'prd';
  children: React.ReactNode;
};

export function AuthRouteBody({ variant, children }: AuthRouteBodyProps) {
  useEffect(() => {
    const className = variant === 'publisher' ? 'publisher-auth-route' : 'prd-auth-route';
    document.body.classList.add(className);
    document.documentElement.classList.add(className);

    return () => {
      document.body.classList.remove(className);
      document.documentElement.classList.remove(className);
    };
  }, [variant]);

  return <>{children}</>;
}
