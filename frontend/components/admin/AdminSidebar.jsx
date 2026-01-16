import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaUsers, 
  FaBuilding, 
  FaBriefcase, 
  FaFileAlt, 
  FaClipboardList, // For Audit Logs
  FaBell,
  FaCog,
  FaSignOutAlt 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaChartLine },
    { name: 'Users', href: '/admin/users', icon: FaUsers },
    { name: 'Employers', href: '/admin/employers', icon: FaBuilding },
    { name: 'Jobs', href: '/admin/jobs', icon: FaBriefcase },
    { name: 'Applications', href: '/admin/applications', icon: FaFileAlt },
    { name: 'Notifications', href: '/admin/notifications', icon: FaBell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FaClipboardList },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                JobPulse
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-widest border border-gray-700 rounded px-1">Admin</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10 bg-black/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-400 rounded-lg hover:bg-white/5 hover:text-red-400 transition-colors group"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-500 group-hover:text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
