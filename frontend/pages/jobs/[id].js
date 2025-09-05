import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaDollarSign, 
  FaBuilding, 
  FaGlobe, 
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaShare,
  FaBookmark,
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaBriefcase
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import JobCard from '../../components/JobCard';

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const [jobRes, relatedRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs?limit=3&exclude=${id}`)
      ]);

      setJob(jobRes.data.data.job);
      setRelatedJobs(relatedRes.data.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load job details');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for this job');
      router.push('/auth/login');
      return;
    }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      const response = await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: '', resume: null });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setApplicationData(prev => ({ ...prev, resume: file }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link href="/jobs" className="btn-primary">
              <FaArrowLeft className="mr-2" />
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{job.title} at {job.company.name} - JobPulse</title>
        <meta name="description" content={job.description.substring(0, 160)} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/jobs" className="text-primary-600 hover:text-primary-500 flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to Jobs
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <div className="card-body p-8">
                  {/* Job Header */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FaBuilding className="mr-2" />
                            {job.company.name}
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="btn-outline btn-sm">
                          <FaBookmark className="mr-1" />
                          Save
                        </button>
                        <button className="btn-outline btn-sm">
                          <FaShare className="mr-1" />
                          Share
                        </button>
                      </div>
                    </div>

                    {/* Job Meta */}
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <FaClock className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{job.type}</span>
                      </div>
                      <div className="flex items-center">
                        <FaDollarSign className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {job.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h2>
                      <ul className="space-y-2">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Required Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Company Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card mt-8"
              >
                <div className="card-body p-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About {job.company.name}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {job.company.description || 'No company description available.'}
                      </p>
                      <div className="space-y-2">
                        {job.company.website && (
                          <div className="flex items-center">
                            <FaGlobe className="text-primary-500 mr-2" />
                            <a
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-500"
                            >
                              {job.company.website}
                            </a>
                          </div>
                        )}
                        {job.company.email && (
                          <div className="flex items-center">
                            <FaEnvelope className="text-primary-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">{job.company.email}</span>
                          </div>
                        )}
                        {job.company.phone && (
                          <div className="flex items-center">
                            <FaPhone className="text-primary-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">{job.company.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={`${job.company.name} logo`}
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FaBuilding className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card sticky top-8"
              >
                <div className="card-body p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apply for this position</h3>
                  
                  {user ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowApplicationModal(true)}
                        className="btn-primary w-full"
                      >
                        <FaFileAlt className="mr-2" />
                        Apply Now
                      </button>
                      <button className="btn-outline w-full">
                        <FaBookmark className="mr-2" />
                        Save Job
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Sign in to apply for this position
                      </p>
                      <Link href="/auth/login" className="btn-primary w-full">
                        Sign In to Apply
                      </Link>
                      <Link href="/auth/register" className="btn-outline w-full">
                        Create Account
                      </Link>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Job Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Job Type:</span>
                        <span className="text-gray-900 dark:text-white">{job.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                        <span className="text-gray-900 dark:text-white">{job.experienceLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Salary Range:</span>
                        <span className="text-gray-900 dark:text-white">
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="card"
                >
                  <div className="card-body p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Jobs</h3>
                    <div className="space-y-4">
                      {relatedJobs.map((relatedJob) => (
                        <JobCard key={relatedJob._id} job={relatedJob} compact />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Apply for {job.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows="4"
                    className="input-field"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, or DOCX files only (max 5MB)
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary flex-1"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
} 