import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBuilding, 
  FaArrowLeft, 
  FaSave,
  FaGlobe,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaMapMarkerAlt,
  FaUsers,
  FaIndustry,
  FaCalendarAlt,
  FaImage,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaFileAlt
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployerProfile() {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profile, setProfile] = useState({
    company: '',
    description: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    benefits: [],
    culture: ''
  });
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    if (userType !== 'employer') {
      router.push('/');
      return;
    }
    fetchProfile();
  }, [userType]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employers/me');
      const data = response.data.data.employer;
      setProfile({
        company: data.company || '',
        description: data.description || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        foundedYear: data.foundedYear || '',
        website: data.website || '',
        location: data.location || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || user?.email || '',
        logo: data.logo || '',
        socialMedia: {
          linkedin: data.socialMedia?.linkedin || '',
          twitter: data.socialMedia?.twitter || '',
          facebook: data.socialMedia?.facebook || ''
        },
        benefits: data.benefits || [],
        culture: data.culture || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/employers/me', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/employers/me/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, logo: response.data.data.logoUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    try {
      await api.delete('/employers/me/logo');
      setProfile(prev => ({ ...prev, logo: '' }));
      toast.success('Logo removed');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !profile.benefits.includes(newBenefit.trim())) {
      setProfile(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit) => {
    setProfile(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
    'Manufacturing', 'Media', 'Real Estate', 'Transportation', 
    'Hospitality', 'Agriculture', 'Energy', 'Construction', 'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Company Profile - JobPulse</title>
        <meta name="description" content="Manage your company profile" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Link href="/employer/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  <FaArrowLeft className="text-xl" />
                </Link>
                <div className="flex items-center space-x-3">
                  <FaBuilding className="text-3xl text-orange-500" />
                  <h1 className="text-3xl font-bold text-white">Company Profile</h1>
                </div>
              </div>
              <p className="text-gray-400">Manage your company information and branding</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaImage className="mr-2 text-orange-500" />
                  Company Logo
                </h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profile.logo ? (
                      <div className="relative">
                        <img 
                          src={profile.logo} 
                          alt="Company logo" 
                          className="w-24 h-24 rounded-xl object-cover border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center">
                        <FaBuilding className="text-3xl text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center px-4 py-2 bg-orange-500/20 text-orange-300 rounded-xl hover:bg-orange-500/30 transition-colors cursor-pointer">
                      <FaImage className="mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </motion.div>

              {/* Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaBuilding className="mr-2 text-orange-500" />
                  Basic Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                    <select
                      value={profile.industry}
                      onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                    <select
                      value={profile.companySize}
                      onChange={(e) => setProfile(prev => ({ ...prev, companySize: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={profile.foundedYear}
                      onChange={(e) => setProfile(prev => ({ ...prev, foundedYear: e.target.value }))}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 2015"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell candidates about your company..."
                  />
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaEnvelope className="mr-2 text-orange-500" />
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location (City)</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Business St, Suite 100, San Francisco, CA 94102"
                  />
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaGlobe className="mr-2 text-orange-500" />
                  Social Media
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <FaLinkedin className="mr-2 text-blue-400" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.linkedin}
                      onChange={(e) => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, linkedin: e.target.value } }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <FaTwitter className="mr-2 text-sky-400" />
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.twitter}
                      onChange={(e) => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, twitter: e.target.value } }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <FaFacebook className="mr-2 text-blue-500" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.facebook}
                      onChange={(e) => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, facebook: e.target.value } }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-orange-500" />
                  Company Benefits
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="ml-2 hover:text-green-100"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Add a benefit (e.g., Health Insurance, Remote Work)"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>

              {/* Culture */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaUsers className="mr-2 text-orange-500" />
                  Company Culture
                </h2>
                <textarea
                  value={profile.culture}
                  onChange={(e) => setProfile(prev => ({ ...prev, culture: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe your company culture, values, and work environment..."
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
