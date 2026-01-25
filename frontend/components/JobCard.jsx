import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBuilding,
  FaArrowRight,
  FaStar,
  FaGlobe,
  FaUserTie,
  FaGraduationCap,
  FaRocket,
  FaCalendarAlt
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import React from 'react'; // Added missing import for React

export default function JobCard({ job, onApply, viewMode = 'grid' }) {
  const { user } = useAuth();
  const isVerified = user?.isVerified;

  const getJobTypeIcon = (jobType) => {
    const icons = {
      'full-time': FaClock,
      'part-time': FaClock,
      'remote': FaGlobe,
      'contract': FaUserTie,
      'internship': FaGraduationCap
    };
    return icons[jobType] || FaBuilding;
  };

  const getJobTypeBadge = (jobType) => {
    const badges = {
      'full-time': 'bg-green-500/20 text-green-300 border-green-500/30',
      'part-time': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'remote': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'contract': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'internship': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return badges[jobType] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const formatSalary = (salary, salaryType = 'Annual') => {
    if (!salary) return 'Not specified';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const formatted = formatter.format(salary);
    const lowerType = String(salaryType).toLowerCase();

    let suffix = ' Annually';
    if (lowerType.includes('month')) {
      suffix = ' Monthly';
    } else if (lowerType.includes('hour')) {
      suffix = ' Hourly';
    }

    return `${formatted}${suffix}`;
  };

  const getExperienceLevel = (level) => {
    const levels = {
      'entry': 'Entry Level',
      'junior': 'Junior',
      'mid': 'Mid Level',
      'senior': 'Senior',
      'executive': 'Executive'
    };
    return levels[level] || level;
  };

  const getExperienceIcon = (level) => {
    const icons = {
      'entry': FaGraduationCap,
      'junior': FaUserTie,
      'mid': FaUserTie,
      'senior': FaStar,
      'executive': FaStar
    };
    return icons[level] || FaUserTie;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors mb-2">
                  {job.title}
                </h3>
                <div className="flex items-center text-gray-300 mb-3">
                  <FaBuilding className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.employer?.company || job.company}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeBadge(job.jobType)}`}>
                {job.jobType.replace('-', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-gray-300">
                <FaMapMarkerAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{job.location}</span>
              </div>

              {job.salary && (
                <div className="flex items-center text-gray-300">
                  <FaDollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-400">
                    {formatSalary(job.salary, job.salaryType)}
                  </span>
                </div>
              )}

              <div className="flex items-center text-gray-300">
                <FaCalendarAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 5 && (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">
                    +{job.tags.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-3 ml-6">
            <Link
              href={`/jobs/${job._id}`}
              className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm"
            >
              <FaArrowRight className="mr-2" />
              View Job
            </Link>

            <button
              onClick={onApply}
              disabled={user && !isVerified}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${user && !isVerified
                  ? 'bg-gray-500/50 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                }`}
              title={user && !isVerified ? 'Please verify your email to apply.' : ''}
            >
              Apply Now
            </button>

            {user && !isVerified && (
              <p className="text-xs text-orange-400 text-center max-w-32">
                Please verify your email to apply
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group cursor-pointer"
    >
      <Link href={`/jobs/${job._id}`}>
        <div className="mb-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors mb-2 break-words">
                {job.title}
              </h3>
              <div className="flex items-center text-gray-300 mb-2">
                <FaBuilding className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{job.employer?.company || job.company}</span>
              </div>
            </div>
            <div className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeBadge(job.jobType)} flex-shrink-0`}>
              {job.jobType.replace('-', ' ')}
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-300">
              <FaMapMarkerAlt className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{job.location}</span>
            </div>

            {job.salary && (
              <div className="flex items-center text-gray-300">
                <FaDollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-green-400">
                  {formatSalary(job.salary, job.salaryType)}
                </span>
              </div>
            )}

            <div className="flex items-center text-gray-300">
              {React.createElement(getExperienceIcon(job.experienceLevel), { className: "w-4 h-4 mr-2 flex-shrink-0" })}
              <span className="text-sm">
                {getExperienceLevel(job.experienceLevel)}
              </span>
            </div>
          </div>

          {/* Description Preview - REMOVED */}
          {/* <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {job.description.length > 150 
              ? `${job.description.substring(0, 150)}...` 
              : job.description
            }
          </p> */}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex items-center text-gray-400 text-sm">
              <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
              <span className="text-sm font-medium mr-1">View Job</span>
              <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={onApply}
        disabled={user && !isVerified}
        className={`w-full py-3 mt-4 rounded-xl font-semibold transition-all duration-300 ${user && !isVerified
            ? 'bg-gray-500/50 cursor-not-allowed text-gray-400'
            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
          }`}
        title={user && !isVerified ? 'Please verify your email to apply.' : ''}
      >
        <FaRocket className="inline mr-2" />
        Apply Now
      </button>

      {user && !isVerified && (
        <p className="text-xs text-orange-400 mt-2 text-center">
          Please verify your email to apply for jobs.
        </p>
      )}
    </motion.div>
  );
} 