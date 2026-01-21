import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaCamera, 
  FaCheckCircle,
  FaBriefcase,
  FaUsers,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaLink
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CompleteEmployerProfile() {
  const router = useRouter();
  const { user, userType, loading: authLoading, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(user?.companyLogo || '');
  const fileInputRef = useRef();
  const hasRedirectedRef = useRef(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      companyDescription: user?.companyDescription || '',
      companyWebsite: user?.companyWebsite || '',
      phone: user?.phone || '',
      address: user?.address || '',
      country: user?.location?.country || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      companyBenefits: user?.companyBenefits || '',
      companyCulture: user?.companyCulture || '',
      industry: user?.industry || '',
      companySize: user?.companySize || '',
      foundedYear: user?.foundedYear || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      facebook: user?.socialLinks?.facebook || '',
      other: user?.socialLinks?.other || ''
    },
  });

  const watchAllFields = watch();

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;
    if (hasRedirectedRef.current) return;

    if (user && user.isVerified && user.isProfileComplete && userType === 'employer') {
        if (router.pathname !== '/employer/dashboard') {
            hasRedirectedRef.current = true;
            router.replace('/employer/dashboard');
        }
        return;
    }

    if (!user || userType !== 'employer') {
        hasRedirectedRef.current = true;
        router.replace('/auth/login');
    }
  }, [user, userType, authLoading, router]);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed for logo.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
    }

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await api.post('/employers/me/upload-logo', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
      });
      const { logoUrl: uploadedUrl } = response.data.data;
      setLogoUrl(uploadedUrl);
      setValue('companyLogo', uploadedUrl);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Construct the payload to match backend schema structure
    const payload = {
        ...data,
        location: {
            country: data.country,
            city: data.city,
            state: data.state
        },
        socialLinks: {
            linkedin: data.linkedin,
            twitter: data.twitter,
            facebook: data.facebook,
            other: data.other
        },
        companyLogo: logoUrl
    };

    try {
      const response = await api.post('/employers/complete-profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const { employer, profileCompletion } = response.data.data;
      
      updateUser({ 
          ...employer, 
          profileCompletion, 
          isProfileComplete: true, 
          isVerified: employer.isVerified 
      });

      toast.success('Welcome aboard! Your profile is ready.');
      
      // Allow redirect
      hasRedirectedRef.current = false;
      setTimeout(() => {
        router.replace('/employer/dashboard');
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !hasRedirectedRef.current)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <Head>
        <title>Complete Your Profile - JobPulse</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">JobPulse</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let's set up your company profile to start hiring top talent.
          </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
            {/* Progress Bar */}
            <div className="bg-gray-100 dark:bg-gray-700 h-2 w-full">
                <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((Object.keys(watchAllFields).filter(k => watchAllFields[k]).length / 15) * 100, 100)}%` }} // Rough progress estimation
                />
            </div>

            <div className="p-8 md:p-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Company Logo Section */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className={`w-32 h-32 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all duration-200 ${logoUrl ? 'border-orange-500 bg-white' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-orange-400'}`}>
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-2xl p-2" />
                                ) : (
                                    <div className="text-center p-4">
                                        <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Upload Logo</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                    <span className="text-white text-sm font-medium">Change Logo</span>
                                </div>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleLogoChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        {logoUploading && <p className="mt-2 text-sm text-orange-500 animate-pulse">Uploading...</p>}
                    </div>

                    {/* Section 1: Basic Info */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                            <FaBuilding className="mr-3 text-orange-500" /> Company Essentials
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Company Name <span className="text-red-500">*</span></label>
                                <input 
                                    {...register('company', { required: 'Company name is required' })}
                                    className="form-input"
                                    placeholder="e.g. Acme Corp"
                                />
                                {errors.company && <p className="form-error">{errors.company.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Website <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FaGlobe className="absolute left-4 top-3.5 text-gray-400" />
                                    <input 
                                        {...register('companyWebsite', { required: 'Website is required' })}
                                        className="form-input pl-10"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                {errors.companyWebsite && <p className="form-error">{errors.companyWebsite.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="form-label">About Company <span className="text-red-500">*</span></label>
                                <textarea 
                                    {...register('companyDescription', { required: 'Description is required' })}
                                    className="form-input min-h-[100px]"
                                    placeholder="Tell potential candidates what makes your company great..."
                                />
                                {errors.companyDescription && <p className="form-error">{errors.companyDescription.message}</p>}
                            </div>
                            
                             <div>
                                <label className="form-label">Industry</label>
                                <input 
                                    {...register('industry')}
                                    className="form-input"
                                    placeholder="e.g. Software, Healthcare"
                                />
                            </div>
                            <div>
                                <label className="form-label">Company Size</label>
                                <select {...register('companySize')} className="form-input">
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location & Contact */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                            <FaMapMarkerAlt className="mr-3 text-orange-500" /> Location & Contact
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                             <div>
                                <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-3.5 text-gray-400" />
                                    <input 
                                        {...register('phone', { required: 'Phone is required' })}
                                        className="form-input pl-10"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                            </div>
                             <div>
                                <label className="form-label">Street Address <span className="text-red-500">*</span></label>
                                <input 
                                    {...register('address', { required: 'Address is required' })}
                                    className="form-input"
                                    placeholder="123 Business Blvd"
                                />
                                {errors.address && <p className="form-error">{errors.address.message}</p>}
                            </div>
                             <div>
                                <label className="form-label">City</label>
                                <input 
                                    {...register('city')}
                                    className="form-input"
                                    placeholder="New York"
                                />
                            </div>
                             <div>
                                <label className="form-label">State / Province</label>
                                <input 
                                    {...register('state')}
                                    className="form-input"
                                    placeholder="NY"
                                />
                            </div>
                             <div>
                                <label className="form-label">Country</label>
                                <input 
                                    {...register('country')}
                                    className="form-input"
                                    placeholder="United States"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Culture & Benefits */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                            <FaUsers className="mr-3 text-orange-500" /> Culture & Benefits
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="form-label">Company Benefits</label>
                                <textarea 
                                    {...register('companyBenefits')}
                                    className="form-input min-h-[80px]"
                                    placeholder="e.g. Health Insurance, Remote Work, 401k..."
                                />
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">List the perks that make your company stand out.</p>
                            </div>
                             <div>
                                <label className="form-label">Company Culture</label>
                                <textarea 
                                    {...register('companyCulture')}
                                    className="form-input min-h-[80px]"
                                    placeholder="Describe your values, work environment, and team dynamic..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Social Links */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                            <FaLink className="mr-3 text-orange-500" /> Social Presence
                        </h3>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="relative">
                                <FaLinkedin className="absolute left-4 top-3.5 text-blue-600" />
                                <input {...register('linkedin')} className="form-input pl-10" placeholder="LinkedIn URL" />
                            </div>
                             <div className="relative">
                                <FaTwitter className="absolute left-4 top-3.5 text-blue-400" />
                                <input {...register('twitter')} className="form-input pl-10" placeholder="Twitter URL" />
                            </div>
                             <div className="relative">
                                <FaFacebook className="absolute left-4 top-3.5 text-blue-800" />
                                <input {...register('facebook')} className="form-input pl-10" placeholder="Facebook URL" />
                            </div>
                             <div className="relative">
                                <FaGlobe className="absolute left-4 top-3.5 text-gray-400" />
                                <input {...register('other')} className="form-input pl-10" placeholder="Other Link" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                    Saving Profile...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Complete Profile <FaCheckCircle className="ml-2" />
                                </span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .form-label {
            @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
        }
        .form-input {
            @apply w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white placeholder-gray-400 dark:placeholder-gray-500;
        }
        .form-error {
            @apply text-red-500 text-xs mt-1 ml-1;
        }
      `}</style>
    </div>
  );
} 