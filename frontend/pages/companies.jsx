import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaBriefcase, 
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaRocket,
  FaStar,
  FaUsers,
  FaIndustry,
  FaArrowRight,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { api } from '../utils/api';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm, locationFilter, industryFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        location: locationFilter,
        industry: industryFilter
      });

      const response = await api.get(`/employers?${params}`);
      setCompanies(response.data.data.employers || []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalCompanies(response.data.data.total || 0);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setIndustryFilter('');
    setCurrentPage(1);
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Marketing',
    'Design',
    'Engineering',
    'Media',
    'Transportation',
    'Energy',
    'Real Estate',
    'Food & Beverage'
  ];

  return (
    <>
      <Head>
        <title>Companies - JobPulse</title>
        <meta name="description" content="Discover top companies hiring on JobPulse" />
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

        <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h1 className="text-5xl font-bold text-white mb-4">
                  Discover Top Companies
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                  Explore companies hiring on JobPulse and find your next opportunity
                </p>
                
                {/* Enhanced Search Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search companies by name, industry, or location..."
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Any location"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industry
                    </label>
                    <div className="relative">
                      <FaIndustry className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      >
                        <option value="">All Industries</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry} className="bg-gray-800">
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    {(searchTerm || locationFilter || industryFilter) && (
                      <button
                        onClick={clearFilters}
                        className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" />
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {loading ? 'Loading companies...' : `${totalCompanies} Companies Found`}
                </h2>
                {(searchTerm || locationFilter || industryFilter) && (
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
            </motion.div>

            {/* Companies Grid/List */}
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
                      <div className="h-8 bg-white/20 rounded mb-4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 bg-white/20 rounded mb-4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 bg-white/20 rounded"></div>
                    </div>
                  ))}
                </motion.div>
              ) : companies.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl">
                    <div className="text-gray-400 mb-6">
                      <FaBuilding className="w-20 h-20 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      No Companies Found
                    </h3>
                    <p className="text-gray-300 mb-8">
                      Try adjusting your search criteria or browse all companies
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                    >
                      <FaRocket className="mr-2" />
                      Browse All Companies
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="companies"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8' : 'space-y-4 mb-8'}
                >
                  {companies.map((company, index) => (
                    <CompanyCard 
                      key={company._id} 
                      company={company} 
                      viewMode={viewMode}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {!loading && companies.length > 0 && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                              page === currentPage
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                : 'text-white hover:bg-white/10'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Company Card Component
function CompanyCard({ company, viewMode, index }) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <FaBuilding className="text-3xl text-gray-400" />
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                  {company.name}
                </h3>
                {company.industry && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-xs font-medium">
                    {company.industry}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {company.location && (
                  <div className="flex items-center text-gray-300">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.location}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center text-gray-300">
                    <FaGlobe className="w-4 h-4 mr-2 flex-shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-orange-400 transition-colors"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {company.jobCount > 0 && (
                  <div className="flex items-center text-gray-300">
                    <FaBriefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{company.jobCount} open positions</span>
                  </div>
                )}

                <div className="flex items-center text-gray-300">
                  <FaUsers className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Active Company</span>
                </div>
              </div>

              {/* Company Description */}
              {company.description && (
                <p className="text-sm text-gray-300 line-clamp-2">
                  {company.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end space-y-3 ml-6">
            <Link
              href={`/companies/${company._id}`}
              className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm"
            >
              <FaEye className="mr-2" />
              View Company
            </Link>
            
            <Link
              href={`/jobs?company=${company._id}`}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              <FaBriefcase className="mr-2" />
              View Jobs
            </Link>
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group"
    >
      {/* Company Logo */}
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mr-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <FaBuilding className="text-2xl text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
            {company.name}
          </h3>
          {company.industry && (
            <p className="text-sm text-gray-300">
              {company.industry}
            </p>
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="space-y-3 mb-4">
        {company.location && (
          <div className="flex items-center text-sm text-gray-300">
            <FaMapMarkerAlt className="mr-2 text-orange-400" />
            {company.location}
          </div>
        )}
        
        {company.website && (
          <div className="flex items-center text-sm text-gray-300">
            <FaGlobe className="mr-2 text-orange-400" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors flex items-center"
            >
              {company.website.replace(/^https?:\/\//, '')}
              <FaExternalLinkAlt className="ml-1 w-3 h-3" />
            </a>
          </div>
        )}
        
        {company.jobCount > 0 && (
          <div className="flex items-center text-sm text-gray-300">
            <FaBriefcase className="mr-2 text-orange-400" />
            {company.jobCount} open positions
          </div>
        )}
      </div>

      {/* Company Description */}
      {company.description && (
        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
          {company.description}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Link
          href={`/companies/${company._id}`}
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm text-center"
        >
          <FaEye className="inline mr-1" />
          View Company
        </Link>
        <Link
          href={`/jobs?company=${company._id}`}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm text-center"
        >
          <FaBriefcase className="inline mr-1" />
          View Jobs
        </Link>
      </div>
    </motion.div>
  );
} 