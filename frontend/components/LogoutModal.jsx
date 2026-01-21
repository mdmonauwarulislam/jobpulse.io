import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';

export default function LogoutModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 overflow-y-auto z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-white/10 p-6 text-left shadow-2xl"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <FaSignOutAlt className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold leading-6 text-white">
                  Sign Out
                </h3>
              </div>

              <div className="mt-2">
                <p className="text-gray-400">
                  Are you sure you want to sign out? You will need to sign in again to access your account.
                </p>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-xl border border-gray-700 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none transition-colors disabled:opacity-50"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50 flex items-center"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Signing out...
                    </>
                  ) : (
                    'Sign Out'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
