import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import AdminSidebar from './AdminSidebar';
import { FaBars } from 'react-icons/fa';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (userType !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, userType, router]);

  if (loading || !user || userType !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} - JobPulse Admin</title>
      </Head>

      <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-white/10 bg-gray-900">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <FaBars className="h-6 w-6" />
            </button>
            <span className="font-bold text-lg">JobPulse Admin</span>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>

          {/* Main Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
