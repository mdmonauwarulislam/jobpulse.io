import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaCheckCircle, FaExclamationTriangle, FaFileAlt, FaEdit } from 'react-icons/fa';

export default function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
        <motion.div
          className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-transparent via-orange-500/40 to-transparent blur"
          animate={{ opacity: [0.2, 0.7, 0.2], scaleY: [0.8, 1.2, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'rotate(15deg) translateX(-50%)', left: '20%' }}
        />
        <motion.div
          className="absolute top-1/3 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-red-500/40 to-transparent blur"
          animate={{ opacity: [0.2, 0.7, 0.2], scaleX: [0.8, 1.2, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-0 bottom-0 right-1/4 w-3 bg-gradient-to-b from-transparent via-orange-400/40 to-transparent blur"
          animate={{ opacity: [0.2, 0.7, 0.2], scaleY: [0.8, 1.2, 0.8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          {/* Edit Profile Button */}
          <button
            onClick={() => router.push('/user/complete-profile')}
            className="absolute top-6 right-6 flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
          {/* Warning Banner (less intrusive, below edit button) */}
          {!user.isVerified && (
            <div className="flex items-center gap-2 mb-4 mt-2 px-4 py-2 bg-yellow-400/10 border-l-4 border-yellow-400 rounded shadow-sm">
              <FaExclamationTriangle className="text-yellow-400 text-lg" />
              <span className="text-yellow-200 text-sm">Please verify your email to access all features.</span>
            </div>
          )}
          <div className="flex flex-col items-center mb-8 mt-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-lg">
              <FaUser />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center">
              {user.name}
              {user.isVerified && <FaCheckCircle className="ml-2 text-green-400" title="Verified" />}
            </h2>
            <div className="flex items-center text-gray-300 mb-1">
              <FaEnvelope className="mr-2" /> {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center text-gray-300 mb-1">
                <FaPhone className="mr-2" /> {user.phone}
              </div>
            )}
            {user.address && (
              <div className="flex items-center text-gray-300 mb-1">
                <FaMapMarkerAlt className="mr-2" /> {user.address}
              </div>
            )}
          </div>
          {/* Section Divider */}
          <div className="border-t border-white/10 my-6" />
          {user.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-1">Summary</h3>
              <p className="text-gray-200 leading-relaxed">{user.summary}</p>
            </div>
          )}
          {user.education && user.education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-1">Education</h3>
              <ul className="space-y-2">
                {user.education.map((edu, idx) => (
                  <li key={idx} className="bg-white/5 border border-white/10 rounded p-3 text-gray-200">
                    <div className="font-semibold">{edu.degree} <span className="text-xs text-gray-400">({edu.year})</span></div>
                    <div className="text-sm">{edu.institution}</div>
                    {edu.description && <div className="text-xs text-gray-400 mt-1">{edu.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user.experience && user.experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-1">Experience</h3>
              <ul className="space-y-2">
                {user.experience.map((exp, idx) => (
                  <li key={idx} className="bg-white/5 border border-white/10 rounded p-3 text-gray-200">
                    <div className="font-semibold">{exp.jobTitle} <span className="text-xs text-gray-400">{exp.company}</span></div>
                    <div className="text-sm">{exp.duration}</div>
                    {exp.description && <div className="text-xs text-gray-400 mt-1">{exp.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user.skills && user.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-semibold shadow">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user.resumeUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-1">Resume</h3>
              <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                <FaFileAlt className="mr-2" /> View Resume
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 