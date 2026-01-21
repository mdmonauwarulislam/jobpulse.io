import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFilter, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaSearch,
  FaDollarSign,
  FaClock,
  FaStar,
  FaRocket,
  FaBuilding,
  FaGlobe,
  FaUserTie,
  FaGraduationCap
} from 'react-icons/fa';
import { api } from '../../utils/api';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);

  // Helper to validate MongoDB ObjectId
  const isValidObjectId = (value) => {
    return /^[a-fA-F0-9]{24}$/.test(value);
  };
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    company: '',
    jobType: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const jobTypes = [
    { value: '', label: 'All Types', icon: FaBriefcase },
    { value: 'full-time', label: 'Full Time', icon: FaClock },
    { value: 'part-time', label: 'Part Time', icon: FaClock },
    { value: 'remote', label: 'Remote', icon: FaGlobe },
    { value: 'contract', label: 'Contract', icon: FaUserTie },
    { value: 'internship', label: 'Internship', icon: FaGraduationCap }
  ];

  const experienceLevels = [
    { value: '', label: 'All Levels', icon: FaUserTie },
    { value: 'entry', label: 'Entry Level', icon: FaGraduationCap },
    { value: 'junior', label: 'Junior', icon: FaUserTie },
    { value: 'mid', label: 'Mid Level', icon: FaUserTie },
    { value: 'senior', label: 'Senior', icon: FaStar },
    { value: 'executive', label: 'Executive', icon: FaStar }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJobs();
  }, [router.query]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add query parameters
      Object.keys(router.query).forEach(key => {
        if (router.query[key]) {
          params.append(key, router.query[key]);
        }
      });

      const response = await api.get(`/jobs?${params.toString()}`);
      // Filter jobs with valid ObjectId _id only
      const jobsData = response.data.data.jobs || [];
      setJobs(jobsData.filter(job => isValidObjectId(job._id)));
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    router.push(`/jobs?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      company: '',
      jobType: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: ''
    });
    router.push('/jobs');
    setShowFilters(false);
  };

  const handleSearch = (searchTerm) => {
    const params = new URLSearchParams(router.query);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <title>Jobs - JobPulse</title>
        <meta name="description" content="Browse thousands of job opportunities with top companies" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          {/* Animated Beams */}
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

        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="py-12 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-5xl font-bold text-white mb-4">
                    Find Your Dream Job
                  </h1>
                  <p className="text-xl text-gray-300 mb-8">
                    Discover thousands of job opportunities with top companies
                  </p>
                  
                  {/* Enhanced Search Bar */}
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search for jobs, companies, or skills..."
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        defaultValue={router.query.search || ''}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch(e.target.value);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSearch(document.querySelector('input').value)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:w-1/4"
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Filters
                    </h2>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden p-2 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300"
                    >
                      {showFilters ? <FaTimes /> : <FaFilter />}
                    </button>
                  </div>

                  <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                      <input
                        type="text"
                        placeholder="Job title, skills, company"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="City, state, or remote"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Company name"
                          value={filters.company}
                          onChange={(e) => handleFilterChange('company', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Job Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                      <select
                        value={filters.jobType}
                        onChange={(e) => handleFilterChange('jobType', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      >
                        {jobTypes.map((type) => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                      <select
                        value={filters.experienceLevel}
                        onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      >
                        {experienceLevels.map((level) => (
                          <option key={level.value} value={level.value} className="bg-gray-800">
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Salary Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSalary}
                            onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxSalary}
                            onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={applyFilters}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Jobs List */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:w-3/4"
              >
                {/* Results Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {loading ? 'Loading...' : `${pagination.totalJobs || jobs.length} Jobs Found`}
                    </h2>
                    {Object.keys(router.query).length > 0 && (
                      <p className="text-gray-300 text-sm mt-1">
                        Showing filtered results
                      </p>
                    )}
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Jobs Grid/List */}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                    >
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 animate-pulse">
                          <div className="h-6 bg-white/20 rounded mb-4"></div>
                          <div className="h-4 bg-white/20 rounded mb-2"></div>
                          <div className="h-4 bg-white/20 rounded mb-4"></div>
                          <div className="h-4 bg-white/20 rounded mb-2"></div>
                          <div className="h-4 bg-white/20 rounded"></div>
                        </div>
                      ))}
                    </motion.div>
                  ) : jobs.length > 0 ? (
                    <motion.div
                      key="jobs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                    >
                      {jobs.map((job) => (
                        <JobCard 
                          key={job._id} 
                          job={job} 
                          viewMode={viewMode}
                          onApply={() => router.push(`/jobs/${job._id}`)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl">
                        <div className="text-gray-400 mb-6">
                          <FaBriefcase className="w-20 h-20 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">
                          No jobs found
                        </h3>
                        <p className="text-gray-300 mb-8">
                          Try adjusting your search criteria or browse all jobs.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                        >
                          <FaRocket className="mr-2" />
                          Browse All Jobs
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-12"
                  >
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={(page) => {
                        const params = new URLSearchParams(router.query);
                        params.set('page', page);
                        router.push(`/jobs?${params.toString()}`);
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 