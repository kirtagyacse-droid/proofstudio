'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ClientLayout({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: any; 
}) {
  const pathname = usePathname();
  
  const isAuthOrPublicRoute = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname.startsWith('/f/') || 
    pathname.startsWith('/p/');

  return (
    <>
      <Sidebar user={user} />
      <main 
        className="main-content animate-in"
        style={{
          marginLeft: isAuthOrPublicRoute ? '0' : '260px',
          marginTop: isAuthOrPublicRoute ? '0' : '48px', // Mobile topbar height
        }}
      >
        {children}
      </main>
      
      <style jsx global>{`
        @media (min-width: 768px) {
          .main-content {
            margin-top: 0 !important;
          }
        }
        @media (max-width: 767px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
