import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaCheckCircle, FaExclamationTriangle, FaFileAlt, FaEdit } from 'react-icons/fa';
import { withAuth } from '../../utils/withAuth';

function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>My Profile - JobPulse</title>
      </Head>

      <div className="w-full max-w-4xl mx-auto">
         {/* Edit Profile Button moved to header area or keep inside card? Keeping inside card is fine but better aligned */}
         
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          {/* Edit Profile Button */}
          <button
            onClick={() => router.push('/user/complete-profile')}
            className="absolute top-6 right-6 flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
          
          {/* Warning Banner */}
          {!user.isVerified && (
            <div className="flex items-center gap-2 mb-4 mt-2 px-4 py-2 bg-yellow-400/10 border-l-4 border-yellow-400 rounded shadow-sm mr-32">
              <FaExclamationTriangle className="text-yellow-400 text-lg" />
              <span className="text-yellow-200 text-sm">Please verify your email to access all features.</span>
            </div>
          )}

          <div className="flex flex-col items-center mb-8 mt-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg border-4 border-white/10">
              <FaUser />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              {user.name}
              {user.isVerified && <FaCheckCircle className="ml-2 text-green-400 text-xl" title="Verified" />}
            </h2>
            <div className="flex items-center text-gray-300 mb-1">
              <FaEnvelope className="mr-2 text-primary-500" /> {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center text-gray-300 mb-1">
                <FaPhone className="mr-2 text-primary-500" /> {user.phone}
              </div>
            )}
            {user.address && (
              <div className="flex items-center text-gray-300 mb-1">
                <FaMapMarkerAlt className="mr-2 text-primary-500" /> {user.address}
              </div>
            )}
          </div>

          {/* Section Divider */}
          <div className="border-t border-white/10 my-8" />

          <div className="grid gap-8">
            {user.summary && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Summary
                </h3>
                <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  {user.summary}
                </p>
              </div>
            )}

            {user.education && user.education.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Education
                </h3>
                <ul className="space-y-3">
                  {user.education.map((edu, idx) => (
                    <li key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-lg">{edu.degree}</div>
                        <span className="text-sm text-orange-400 font-medium px-2 py-1 bg-orange-500/10 rounded">{edu.year}</span>
                      </div>
                      <div className="text-gray-400">{edu.institution}</div>
                      {edu.description && <div className="text-sm text-gray-500 mt-2 border-t border-white/5 pt-2">{edu.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {user.experience && user.experience.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Experience
                </h3>
                <ul className="space-y-3">
                  {user.experience.map((exp, idx) => (
                    <li key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 hover:bg-white/10 transition-colors">
                      <div className="font-semibold text-lg text-white">{exp.jobTitle}</div>
                      <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                        <span className="font-medium text-primary-400">{exp.company}</span>
                        <span>{exp.duration}</span>
                      </div>
                      {exp.description && <div className="text-gray-300 mt-2 text-sm leading-relaxed">{exp.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-200 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors hover:border-orange-500/50 hover:text-orange-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.resumeUrl && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Resume
                </h3>
                <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 group">
                  <FaFileAlt className="mr-3 text-orange-500 group-hover:scale-110 transition-transform" /> 
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Protect this route - require user authentication
export default withAuth(UserProfile, {
  requiredUserType: 'user',
  redirectTo: '/auth/login'
}); 