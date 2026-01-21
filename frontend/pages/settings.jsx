import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaEnvelope,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

export default function Settings({ isEmbedded = false }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  // Default to 'security' for everyone now
  const [activeTab, setActiveTab] = useState('security');

  // Initialize form data based on user role
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    jobRecommendations: true,
    securityAlerts: true
  });

  // Profile data state removed as it is no longer used here

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    // Mock implementation
    toast.success('Notification preferences saved');
  };

  // Tab Button Component for consistent styling
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-4 border-b-2 transition-all font-medium whitespace-nowrap ${
        activeTab === id
          ? 'border-orange-500 text-orange-500'
          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
      }`}
    >
      <Icon className={`mr-2 ${activeTab === id ? 'text-orange-500' : 'text-gray-500'}`} />
      {label}
    </button>
  );

  return (
    <>
      <Head>
        <title>Settings | JobPulse</title>
      </Head>

      {/* Adjusted container: full width and no padding if embedded */}
      <div className={`min-h-screen ${isEmbedded ? 'w-full' : 'bg-black pt-20 pb-12 px-4 sm:px-6 lg:px-8'}`}>
        <div className={`${isEmbedded ? 'w-full' : 'max-w-4xl mx-auto'}`}>
          {!isEmbedded && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-400">Manage your account preferences</p>
            </motion.div>
          )}

          {isEmbedded && (
             <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account preferences</p>
             </div>
          )}

          <div className="flex flex-col gap-6">
            {/* Horizontal Tabs Navigation */}
            <div className="border-b border-gray-800 overflow-x-auto no-scrollbar">
              <nav className="flex space-x-1" aria-label="Tabs">
                <TabButton id="security" label="Security" icon={FaShieldAlt} />
                <TabButton id="notifications" label="Notifications" icon={FaBell} />
              </nav>
            </div>

            {/* Main Content Area */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-[500px]"
            >


              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FaShieldAlt className="mr-3 text-orange-500" />
                    Security Settings
                  </h2>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showPassword ? <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : <FaEye className="text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showNewPassword ? <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : <FaEye className="text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-white"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center disabled:opacity-70"
                      >
                         {loading ? (
                          <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Changing...</span>
                        ) : (
                          <span className="flex items-center"><FaSave className="mr-2" /> Change Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FaBell className="mr-3 text-orange-500" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                        <div>
                          <h3 className="font-medium text-white">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => {
                              setNotificationSettings({
                                ...notificationSettings,
                                [key]: e.target.checked
                              });
                              handleNotificationUpdate();
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}