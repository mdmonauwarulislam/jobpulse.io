import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaBuilding,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaImage,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPen,
  FaBriefcase,
  FaGlobe,
  FaCalendarAlt,
  FaCheck,
  FaPlus,
  FaSave,
  FaUsers
} from 'react-icons/fa';

import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { withAuth } from '../../utils/withAuth';
import DashboardLayout from '../../components/DashboardLayout';

function EmployerProfile() {
  const { user, userType } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');

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

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employers/me');
      const data = res.data.data.employer;

      setProfile({
        company: data.company || '',
        description: data.companyDescription || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        foundedYear: data.foundedYear || '',
        website: data.companyWebsite || '',
        location: data.location?.city || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || user?.email || '',
        logo: data.companyLogo || '',
        socialMedia: {
          linkedin: data.socialLinks?.linkedin || '',
          twitter: data.socialLinks?.twitter || '',
          facebook: data.socialLinks?.facebook || ''
        },
        benefits: data.companyBenefits
          ? data.companyBenefits.split(',').map(b => b.trim())
          : [],
        culture: data.companyCulture || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (userType !== 'employer') {
      router.replace('/');
      return;
    }

    if (user?.isVerified) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userType, user]);

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        company: profile.company,
        companyDescription: profile.description,
        industry: profile.industry,
        companySize: profile.companySize,
        foundedYear: profile.foundedYear,
        companyWebsite: profile.website,
        location: { city: profile.location },
        address: profile.address,
        phone: profile.phone,
        socialLinks: profile.socialMedia,
        companyBenefits: profile.benefits.join(','),
        companyCulture: profile.culture
      };

      await api.put('/employers/me', payload);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- LOGO UPLOAD ---------------- */
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      const res = await api.post('/employers/me/upload-logo', formData);
      setProfile(prev => ({ ...prev, logo: res.data.data.logoUrl }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  /* ---------------- BENEFITS ---------------- */
  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    if (profile.benefits.includes(newBenefit.trim())) return;

    setProfile(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit.trim()]
    }));
    setNewBenefit('');
  };

  const removeBenefit = (benefit) => {
    setProfile(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const industries = [
    'Technology','Healthcare','Finance','Education','Retail',
    'Manufacturing','Media','Real Estate','Transportation',
    'Hospitality','Agriculture','Energy','Construction','Other'
  ];

  const companySizes = [
    '1-10 employees','11-50 employees','51-200 employees',
    '201-500 employees','501-1000 employees','1000+ employees'
  ];

  /* ---------------- LOADER ---------------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <Head>
        <title>Company Profile - JobPulse</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
        {/* Verification Alert */}
        {!user?.isVerified && (
          <div className="bg-orange-500 text-white text-center py-3 px-4 font-medium sticky top-0 z-30 shadow-sm">
            Please verify your email address to unlock full profile editing capabilities.
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative h-64 w-full group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 animate-gradient-x" />
          <div className="absolute inset-0 bg-pattern opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:items-end">
                {/* Logo Section */}
                <div className="relative shrink-0">
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white dark:bg-gray-700 shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center relative group">
                      {profile.logo ? (
                        <img src={profile.logo} alt={profile.company} className="w-full h-full object-contain p-2" />
                      ) : (
                        <FaBuilding className="text-5xl text-gray-300 dark:text-gray-500" />
                      )}
                      
                      {/* Logo Upload Overlay - Visible in Edit Mode via Modal, but we can also add quick edit here if needed (skipping for now to keep focus on Modal) */}
                   </div>
                </div>

                {/* Company Info Header */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile.company || 'Your Company Name'}
                      </h1>
                      
                      <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        {profile.industry && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                            <FaBriefcase className="text-orange-500" /> {profile.industry}
                          </span>
                        )}
                        {profile.location && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                            <FaMapMarkerAlt className="text-orange-500" /> {profile.location}
                          </span>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full hover:text-orange-500 transition-colors">
                            <FaGlobe className="text-orange-500" /> Website
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <FaPen className="text-sm" /> Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column: Main Info (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"/> About Us
                </h3>
                {profile.description ? (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {profile.description}
                  </p>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                    <p className="text-gray-500">No company description added yet.</p>
                  </div>
                )}
              </motion.section>

              {/* Culture Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"/> Work Culture
                </h3>
                {profile.culture ? (
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                     {profile.culture}
                   </p>
                ) : (
                   <p className="text-gray-500 italic">Tell candidates about your company culture and values.</p>
                )}
              </motion.section>

              {/* Benefits Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"/> Benefits & Perks
                </h3>
                
                {profile.benefits.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl text-green-800 dark:text-green-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center shrink-0">
                          <FaCheck className="text-xs text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No benefits listed yet.</p>
                )}
              </motion.section>
            </div>

            {/* Right Column: Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Company Details Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Company Overiew</h4>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                      <FaUsers />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Company Size</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{profile.companySize || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Founded In</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{profile.foundedYear || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                     <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                       <FaBriefcase />
                     </div>
                     <div>
                       <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                       <p className="font-semibold text-gray-900 dark:text-white">{profile.industry || 'N/A'}</p>
                     </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Card */}
              <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.1 }}
                 className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Contact Info</h4>
                <div className="space-y-4">
                  {profile.email && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <FaEnvelope className="text-gray-400" /> <span className="truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <FaPhone className="text-gray-400" /> <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" /> <span>{profile.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                   <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Social Media</h5>
                   <div className="flex gap-3">
                     {profile.socialMedia.linkedin && (
                       <a href={profile.socialMedia.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                         <FaLinkedin />
                       </a>
                     )}
                     {profile.socialMedia.twitter && (
                        <a href={profile.socialMedia.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors">
                          <FaTwitter />
                        </a>
                     )}
                     {profile.socialMedia.facebook && (
                        <a href={profile.socialMedia.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
                          <FaFacebook />
                        </a>
                      )}
                      {(!profile.socialMedia.linkedin && !profile.socialMedia.twitter && !profile.socialMedia.facebook) && (
                        <span className="text-gray-400 text-sm">No social links added.</span>
                      )}
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL - FULLY RESTORED & MODERNIZED */}
      <AnimatePresence>
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10 sticky top-0 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Company Profile</h2>
                <button 
                  onClick={() => setEditMode(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Branding & Basic Info */}
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">Basic Information</h3>
                     
                     <div className="flex gap-6 items-start">
                        {/* Logo Upload in Edit Mode */}
                        <div className="shrink-0 relative group">
                           <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                              {profile.logo ? (
                                 <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                 <FaImage className="text-gray-400 text-2xl" />
                              )}
                              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                                 <FaPen className="mb-1" /> Change
                                 <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              </label>
                           </div>
                           {uploadingLogo && <p className="text-xs text-orange-500 mt-1 text-center">Uploading...</p>}
                        </div>

                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                           <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                              <input 
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={profile.company}
                                onChange={e => setProfile({...profile, company: e.target.value})}
                                placeholder="e.g. Acme Corp"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                              <select 
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={profile.industry}
                                onChange={e => setProfile({...profile, industry: e.target.value})}
                              >
                                <option value="">Select Industry</option>
                                {industries.map(i => <option key={i} value={i}>{i}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                              <select 
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={profile.companySize}
                                onChange={e => setProfile({...profile, companySize: e.target.value})}
                              >
                                <option value="">Select Size</option>
                                {companySizes.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Section 2: Contact Details */}
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">Contact Details</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                           <input type="url" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="https://..." />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Founded Year</label>
                           <input type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.foundedYear} onChange={e => setProfile({...profile, foundedYear: e.target.value})} placeholder="YYYY" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                           <input type="tel" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (City)</label>
                           <input className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
                           <textarea rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" 
                             value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                        </div>
                     </div>
                  </div>

                  {/* Section 3: Detailed Info */}
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">About & Culture</h3>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
                        <textarea rows={5} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} placeholder="Tell us about your company..." />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Culture</label>
                        <textarea rows={3} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.culture} onChange={e => setProfile({...profile, culture: e.target.value})} placeholder="What's it like to work there?" />
                     </div>
                  </div>

                  {/* Section 4: Benefits */}
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">Benefits</h3>
                     <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2 mb-4">
                           <input 
                              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                              placeholder="Add a benefit (e.g. Remote Work, 401k)..."
                              value={newBenefit}
                              onChange={e => setNewBenefit(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                           />
                           <button type="button" onClick={addBenefit} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                              <FaPlus />
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {profile.benefits.map((b, i) => (
                              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                 {b}
                                 <button type="button" onClick={() => removeBenefit(b)} className="text-red-500 hover:text-red-600"><FaTimes /></button>
                              </span>
                           ))}
                           {profile.benefits.length === 0 && <span className="text-gray-400 text-sm italic">No benefits added yet.</span>}
                        </div>
                     </div>
                  </div>

                  {/* Section 5: Social Media */}
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">Social Media</h3>
                     <div className="grid md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                           <input className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.socialMedia.linkedin} onChange={e => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, linkedin: e.target.value } }))} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter URL</label>
                           <input className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.socialMedia.twitter} onChange={e => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, twitter: e.target.value } }))} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                           <input className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                             value={profile.socialMedia.facebook} onChange={e => setProfile(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, facebook: e.target.value } }))} />
                        </div>
                     </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3">
                 <button 
                   onClick={() => setEditMode(false)}
                   className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSubmit}
                   disabled={saving}
                   className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-orange-500/25 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                   ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                   )}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default withAuth(EmployerProfile, {
  requiredUserType: 'employer',
  redirectTo: '/auth/login'
});
