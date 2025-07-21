
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  useEffect(() => {
    // This now correctly redirects any authenticated user who is NOT an admin
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      redirect('/dashboard');
    }
  }, [session, status]);


  if (status === 'loading') {
    return (
        <div className="flex min-h-screen items-center justify-center">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <p>Loading & Verifying Access...</p>
            </div>
        </div>
    );
  }
  
  // Render children only if authenticated and admin role is confirmed
  if (session?.user?.role === 'admin') {
     return <>{children}</>;
  }

  // Fallback for edge cases, though should be covered by redirects.
  return null;
}
