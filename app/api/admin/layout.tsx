'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se o usuário é admin
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.status === 403) {
          router.push('/');
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}