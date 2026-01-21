import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaClock, 
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaTrash
} from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../utils/api';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function EditJob() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [job, setJob] = useState(null);
  const [jobType, setJobType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('entry');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const salaryMin = watch('salaryMin');
  const salaryMax = watch('salaryMax');

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' }
  ];

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const jobData = response.data.data.job;
      setJob(jobData);
      setJobType(jobData.type);
      setExperienceLevel(jobData.experienceLevel);

      // Set form values
      setValue('title', jobData.title);
      setValue('location', jobData.location);
      setValue('remote', jobData.remote || 'no');
      setValue('salaryMin', jobData.salaryMin);
      setValue('salaryMax', jobData.salaryMax);
      setValue('description', jobData.description);
      setValue('requirements', jobData.requirements?.join('\n') || '');
      setValue('skills', jobData.skills?.join(', ') || '');
      setValue('benefits', jobData.benefits?.join('\n') || '');
      setValue('deadline', jobData.deadline ? new Date(jobData.deadline).toISOString().split('T')[0] : '');
      setValue('applicationUrl', jobData.applicationUrl || '');
    } catch (error) {
      toast.error('Failed to load job details');
      router.push('/employer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // Check if user is employer - use userType from context or check profile
    if (!user || (user.userType && user.userType !== 'employer') && (user.role && user.role !== 'employer')) {
       // Fallback: if user exists but checks fail, maybe context isn't fully synced or using different field
       // But usually userType from useAuth is the ground truth
       if (userType !== 'employer') {
          toast.error('Only employers can edit jobs');
          return;
       }
    }

    setSaving(true);
    try {
      const jobData = {
        ...data,
        type: jobType,
        experienceLevel,
        salaryMin: parseInt(data.salaryMin),
        salaryMax: parseInt(data.salaryMax),
        requirements: data.requirements.split('\n').filter(req => req.trim()),
        benefits: data.benefits.split('\n').filter(benefit => benefit.trim()),
        skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      const response = await api.put(`/jobs/${id}`, jobData);

      if (response.data.success) {
        toast.success('Job updated successfully!');
        router.push('/employer/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update job. Please try again.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete(`/jobs/${id}`);

      if (response.data.success) {
        toast.success('Job deleted successfully!');
        router.push('/employer/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete job. Please try again.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The job you're trying to edit doesn't exist or has been removed.</p>
            <Link href="/employer/dashboard" className="btn-primary">
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Job - JobPulse</title>
        <meta name="description" content="Edit your job posting on JobPulse" />
      </Head>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-100px)]">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Link href="/employer/dashboard" className="text-primary-600 hover:text-primary-500">
                    <FaArrowLeft className="text-xl" />
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Edit Job Posting
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Update your job posting to attract the best candidates
                </p>
              </div>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-outline text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                ) : (
                  <FaTrash className="mr-2" />
                )}
                {deleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="card">
              <div className="card-body p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaBriefcase className="mr-2 text-primary-500" />
                      Basic Information
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Job Title */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Job Title *
                        </label>
                        <input
                          {...register('title', {
                            required: 'Job title is required',
                            minLength: {
                              value: 3,
                              message: 'Job title must be at least 3 characters',
                            },
                          })}
                          type="text"
                          className="input-field"
                          placeholder="e.g., Senior Software Engineer"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                        )}
                      </div>

                      {/* Job Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Job Type *
                        </label>
                        <select
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                          className="input-field"
                        >
                          {jobTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Experience Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Experience Level *
                        </label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="input-field"
                        >
                          {experienceLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...register('location', {
                              required: 'Location is required',
                            })}
                            type="text"
                            className="input-field pl-10"
                            placeholder="e.g., New York, NY"
                          />
                        </div>
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
                        )}
                      </div>

                      {/* Remote Option */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Remote Work
                        </label>
                        <select
                          {...register('remote')}
                          className="input-field"
                        >
                          <option value="no">No Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="full">Fully Remote</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Salary Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaDollarSign className="mr-2 text-primary-500" />
                      Salary Information
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Salary (USD) *
                        </label>
                        <input
                          {...register('salaryMin', {
                            required: 'Minimum salary is required',
                            min: {
                              value: 0,
                              message: 'Salary must be positive',
                            },
                          })}
                          type="number"
                          className="input-field"
                          placeholder="50000"
                        />
                        {errors.salaryMin && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salaryMin.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Salary (USD) *
                        </label>
                        <input
                          {...register('salaryMax', {
                            required: 'Maximum salary is required',
                            min: {
                              value: 0,
                              message: 'Salary must be positive',
                            },
                            validate: (value) => {
                              if (salaryMin && parseInt(value) < parseInt(salaryMin)) {
                                return 'Maximum salary must be greater than minimum salary';
                              }
                              return true;
                            },
                          })}
                          type="number"
                          className="input-field"
                          placeholder="80000"
                        />
                        {errors.salaryMax && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salaryMax.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaEdit className="mr-2 text-primary-500" />
                      Job Description
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Description *
                      </label>
                      <textarea
                        {...register('description', {
                          required: 'Job description is required',
                          minLength: {
                            value: 50,
                            message: 'Description must be at least 50 characters',
                          },
                        })}
                        rows="8"
                        className="input-field"
                        placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaEdit className="mr-2 text-primary-500" />
                      Requirements & Skills
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Requirements (one per line)
                        </label>
                        <textarea
                          {...register('requirements')}
                          rows="6"
                          className="input-field"
                          placeholder="• 3+ years of experience in React
• Strong understanding of JavaScript
• Experience with Node.js and Express
• Excellent communication skills"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Required Skills (comma-separated)
                        </label>
                        <input
                          {...register('skills')}
                          type="text"
                          className="input-field"
                          placeholder="React, JavaScript, Node.js, Express, MongoDB"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaEdit className="mr-2 text-primary-500" />
                      Benefits & Perks
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Benefits (one per line)
                      </label>
                      <textarea
                        {...register('benefits')}
                        rows="6"
                        className="input-field"
                        placeholder="• Competitive salary and equity
• Health, dental, and vision insurance
• Flexible work hours and remote options
• Professional development budget
• Team events and activities"
                      />
                    </div>
                  </div>

                  {/* Application Settings */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <FaClock className="mr-2 text-primary-500" />
                      Application Settings
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Application Deadline
                        </label>
                        <input
                          {...register('deadline')}
                          type="date"
                          className="input-field"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Application URL (Optional)
                        </label>
                        <input
                          {...register('applicationUrl')}
                          type="url"
                          className="input-field"
                          placeholder="https://company.com/apply"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/employer/dashboard"
                      className="btn-outline"
                    >
                      <FaArrowLeft className="mr-2" />
                      Cancel
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex items-center"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
       </div>
      </div>
    </DashboardLayout>
  );
} 