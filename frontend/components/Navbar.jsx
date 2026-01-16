import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaBriefcase, 
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaSearch,
  FaHome,
  FaBuilding,
  FaInfoCircle,
  FaEnvelope,
  FaComments
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout, isEmployer, isAdmin } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Jobs', href: '/jobs', icon: FaBriefcase },
    { name: 'Companies', href: '/companies', icon: FaBuilding },
    { name: 'About', href: '/about', icon: FaInfoCircle },
    { name: 'Contact', href: '/contact', icon: FaEnvelope },
  ];

  const userMenuItems = [
    {
      name: 'Dashboard',
      href: isEmployer() ? '/employer/dashboard' : isAdmin() ? '/admin/dashboard' : '/user/dashboard',
      icon: FaUser,
    },
    {
      name: 'Profile',
      href: isEmployer() ? '/employer/profile' : '/user/profile',
      icon: FaUser,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: FaComments,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: FaBell,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: FaCog,
    },
  ];

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-black/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <FaBriefcase className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-white">
              JobPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  router.pathname === item.href
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-xl border border-white/10 py-1"
                    >
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-left"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 py-4"
            >
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      router.pathname === item.href
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {!user && (
                  <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setSidebarOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setSidebarOpen(false)}
                      className="block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 