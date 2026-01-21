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
  FaBriefcase,
  FaTimes,
  FaCloudUploadAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import JobCard from '../../components/JobCard';

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, userType } = useAuth();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: '', resume: null });
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Helper to validate MongoDB ObjectId
  const isValidObjectId = (value) => {
    return /^[a-fA-F0-9]{24}$/.test(value);
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

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0); // Scroll to top on load/refresh

    if (!isValidObjectId(id)) {
      toast.error('Invalid job ID');
      router.push('/jobs');
      return;
    }
    fetchJobDetails();
  }, [id]);

  // Check application status when user/job loads
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        console.log('Checking application status for job:', job._id);
        const { data } = await api.get(`/applications/check/${job._id}`);
        console.log('Application status response:', data);

        if (data.success) {
          console.log('Setting hasApplied:', data.hasApplied);
          setHasApplied(data.hasApplied);
          setApplicationDetails(data.application);
        }
      } catch (error) {
        console.error('Failed to check application status:', error);
      }
    };

    if (user && job && (userType === 'user' || userType === 'jobseeker')) {
      checkApplicationStatus();
      checkSavedStatus();
    }
  }, [user, job, userType]);

  const checkSavedStatus = async () => {
    try {
      // Since there's no direct "check" endpoint, we fetch user's saved jobs
      // Ideally backend should provide a check endpoint or include isSaved in job details
      const { data } = await api.get('/users/saved-jobs?limit=100');
      if (data.success) {
        const saved = data.data.savedJobs.find(savedJob =>
          (savedJob.job._id === job._id) || (savedJob.job === job._id)
        );
        setIsSaved(!!saved);
      }
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

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
        setHasApplied(true);
        setApplicationDetails(response.data.data.application);
      }
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to submit application';
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

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save this job');
      router.push('/auth/login');
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/users/saved-jobs/${job._id}`);
        setIsSaved(false);
        toast.success('Job removed from saved list');
      } else {
        await api.post('/users/saved-jobs', { jobId: job._id });
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Failed to toggle save job:', error);
      toast.error(error.response?.data?.error || 'Failed to update saved status');
    } finally {
      setSaveLoading(false);
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
        <title>{job.title} at {job.employer?.company || 'Company'} - JobPulse</title>
        <meta name="description" content={job.description.replace(/<[^>]+>/g, '').substring(0, 160)} />
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
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FaBuilding className="mr-2" />
                            {job.employer?.company || 'Company'}
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className={`btn-sm ${isSaved ? 'btn-primary' : 'btn-outline'}`}
                          onClick={handleSaveJob}
                          disabled={saveLoading}
                        >
                          <FaBookmark className="mr-1" />
                          {isSaved ? 'Saved' : 'Save'}
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">{job.jobType}</span>
                      </div>
                      <div className="flex items-center">
                        <FaBriefcase className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center">
                        <FaDollarSign className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatSalary(job.salary, job.salaryType)}
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
                      <div
                        dangerouslySetInnerHTML={{ __html: job.description }}
                        className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {(Array.isArray(job.requirements)
                          ? job.requirements
                          : job.requirements.split('\n').filter(item => item.trim())
                        ).map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h2>
                      <ul className="space-y-2">
                        {(Array.isArray(job.benefits)
                          ? job.benefits
                          : job.benefits.split('\n').filter(item => item.trim())
                        ).map((benefit, index) => (
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About {job.employer?.company || 'Company'}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {job.employer?.companyDescription || 'No company description available.'}
                      </p>
                      <div className="space-y-2">
                        {job.employer?.companyWebsite && (
                          <div className="flex items-center">
                            <FaGlobe className="text-primary-500 mr-2" />
                            <a
                              href={job.employer.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-500"
                            >
                              {job.employer.companyWebsite}
                            </a>
                          </div>
                        )}
                        {job.employer?.contactEmail && (
                          <div className="flex items-center">
                            <FaEnvelope className="text-primary-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">{job.employer.contactEmail}</span>
                          </div>
                        )}
                        {job.employer?.phone && (
                          <div className="flex items-center">
                            <FaPhone className="text-primary-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">{job.employer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      {job.employer?.companyLogo ? (
                        <img
                          src={job.employer.companyLogo}
                          alt={`${job.employer.company} logo`}
                          className="w-32 h-32 object-contain rounded-xl"
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
                className="card top-8"
              >
                <div className="card-body p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apply for this position</h3>

                  {user ? (
                    <div className="space-y-4">
                      {hasApplied ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-lg text-center">
                          <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                            <FaCheckCircle className="text-2xl" />
                          </div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">
                            {applicationDetails?.status === 'pending' ? 'Application Submitted' : `Application ${applicationDetails?.status?.charAt(0).toUpperCase() + applicationDetails?.status?.slice(1)}`}
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1 capitalize">
                            Status: {applicationDetails?.status}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Applied on {new Date(applicationDetails?.createdAt).toLocaleDateString()}
                          </p>
                          <Link href="/user/applications" className="mt-3 block text-sm font-medium text-green-600 hover:text-green-700 hover:underline">
                            View My Applications
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowApplicationModal(true)}
                          className="btn-primary w-full"
                        >
                          <FaFileAlt className="mr-2" />
                          Apply Now
                        </button>
                      )}

                      <button
                        className={`w-full ${isSaved ? 'btn-primary' : 'btn-outline'}`}
                        onClick={handleSaveJob}
                        disabled={saveLoading}
                      >
                        <FaBookmark className="mr-2" />
                        {isSaved ? 'Saved' : 'Save Job'}
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
                        <span className="text-gray-900 dark:text-white">{job.jobType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                        <span className="text-gray-900 dark:text-white capitalize">{job.experienceLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Salary Range:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatSalary(job.salary, job.salaryType)}
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
                      {relatedJobs.filter(j => /^[a-fA-F0-9]{24}$/.test(j._id)).map((relatedJob) => (
                        <JobCard
                          key={relatedJob._id}
                          job={relatedJob}
                          compact
                          onApply={() => router.push(`/jobs/${relatedJob._id}`)}
                        />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplicationModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Apply for {job.title}
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows="5"
                    className="input-field resize-none w-full text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Tell us why you are a great fit for this role..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>

                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 transition-colors hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-center group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-500 mb-3 group-hover:scale-110 transition-transform">
                        {applicationData.resume ? <FaFileAlt size={20} /> : <FaCloudUploadAlt size={24} />}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {applicationData.resume ? applicationData.resume.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {applicationData.resume ? (
                          <span className="text-green-500 font-medium">Ready to submit</span>
                        ) : (
                          'PDF, DOC, DOCX up to 5MB'
                        )}
                      </p>
                    </div>
                  </div>

                  {user?.resumeUrl && !applicationData.resume && (
                    <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <FaFileAlt className="mr-2 text-primary-500" />
                      <span>
                        No file selected? We'll use your <span className="font-medium text-gray-900 dark:text-white">default profile resume</span> automatically.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="btn-outline flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary flex-1 py-2.5 shadow-lg shadow-primary-500/20"
                >
                  {applying ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
} 