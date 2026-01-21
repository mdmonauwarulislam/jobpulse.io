import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBriefcase,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaEnvelope,
  FaBell,
  FaCog,
  FaBookmark
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import LogoutModal from './LogoutModal';

export default function DashboardLayout({ children }) {
  const { user, logout, userType } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const employerNavigation = [
    { name: 'Overview', href: '/employer/dashboard', icon: FaChartLine },
    { name: 'My Jobs', href: '/employer/jobs', icon: FaBriefcase },
    { name: 'Applications', href: '/employer/applications', icon: FaUsers },
    { name: 'Messages', href: '/employer/messages', icon: FaEnvelope },
    { name: 'Notifications', href: '/employer/notifications', icon: FaBell },
    { name: 'Company Profile', href: '/employer/profile', icon: FaBuilding },
    { name: 'Settings', href: '/employer/settings', icon: FaCog },
  ];

  const userNavigation = [
    { name: 'Overview', href: '/user/dashboard', icon: FaChartLine },
    { name: 'My Applications', href: '/user/applications', icon: FaBriefcase },
    { name: 'Saved Jobs', href: '/user/saved-jobs', icon: FaBookmark },
    { name: 'My Profile', href: '/user/profile', icon: FaUserCircle },
    { name: 'Resume', href: '/user/resume', icon: FaBriefcase },
    { name: 'Settings', href: '/user/settings', icon: FaCog },
  ];

  const navigation = userType === 'employer' ? employerNavigation : userNavigation;

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    await logout();
    setLogoutLoading(false);
    setLogoutModalOpen(false);
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 text-white">
      {/* User Info Section - Top of Sidebar */}
      <div className={`p-6 border-b border-gray-800 ${sidebarOpen ? '' : 'flex justify-center'}`}>
        <div className="flex items-center space-x-3">
          {user?.logo ? (
            <img
              src={user.logo}
              alt="Company Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border-2 border-primary-500 text-primary-500">
              <FaUserCircle className="text-2xl" />
            </div>
          )}
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.company || user?.name || 'Employer'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${isActive
                ? 'bg-primary-500/10 text-primary-500'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <item.icon className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''} ${isActive ? 'text-primary-500' : 'text-gray-500 group-hover:text-white'}`} />
              {sidebarOpen && (
                <span className="font-medium truncate">{item.name}</span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-gray-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden md:flex p-4 border-t border-gray-800 justify-end">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogoutClick}
          className={`flex items-center w-full px-3 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
          {sidebarOpen && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between text-white sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href={userType === 'employer' ? "/employer/dashboard" : "/user/dashboard"} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-red-500">
            JobPulse
          </Link>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <FaBars className="text-xl" />
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col z-20 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'
            }`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Mockup (Overlay) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-gray-900 z-50 md:hidden"
              >
                <div className="flex justify-end p-4">
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                    <FaTimes />
                  </button>
                </div>
                <div className="h-full pb-20">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black relative">
          {/* Gradient Background Effect */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-900 dark:to-transparent opacity-50" />
          </div>

          <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={logoutLoading}
      />
    </div>
  );
}
