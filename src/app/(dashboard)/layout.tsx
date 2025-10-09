'use client';

// import { useRequireAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { isAuthenticated, isLoading } = useRequireAuth();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin text-4xl mb-4">⏳</div>
  //         <p className="text-gray-600">جاري التحميل...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null; // Will redirect to login
  // }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}


