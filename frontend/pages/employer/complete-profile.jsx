import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRef } from 'react';

export default function CompleteEmployerProfile() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(user?.companyLogo || '');
  const fileInputRef = useRef();

  if (!user || user.role !== 'employer' || user.isProfileComplete) {
    if (typeof window !== 'undefined') router.replace('/employer/dashboard');
    return null;
  }

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      companyDescription: user?.companyDescription || '',
      companyWebsite: user?.companyWebsite || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed for logo.');
      return;
    }
    setLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const response = await api.post('/auth/employer/upload-logo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { logoUrl: uploadedUrl } = response.data.data;
      setLogoUrl(uploadedUrl);
      setValue('companyLogo', uploadedUrl);
      toast.success('Logo uploaded!');
    } catch (error) {
      toast.error('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/completeEmployerProfile', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { employer, profileCompletion } = response.data.data;
      updateUser({ ...employer, profileCompletion });
      toast.success('Profile completed!');
      router.push('/employer/dashboard');
    } catch (error) {
      toast.error('Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      {/* Profile Completion Progress */}
      <div className="w-full max-w-xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-800 font-semibold">Profile Completion</span>
          <span className="text-orange-500 font-bold">{user.profileCompletion ?? 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${user.profileCompletion ?? 0}%` }}
          ></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Company Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Name<span className="text-red-500">*</span></label>
            <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Your name" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Company Name<span className="text-red-500">*</span></label>
            <input {...register('company', { required: 'Company name is required' })} className="input" placeholder="Company name" />
            {errors.company && <span className="text-red-500 text-xs">{errors.company.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Company Description<span className="text-red-500">*</span></label>
            <textarea {...register('companyDescription', { required: 'Description is required' })} className="input" placeholder="Describe your company" />
            {errors.companyDescription && <span className="text-red-500 text-xs">{errors.companyDescription.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Company Website<span className="text-red-500">*</span></label>
            <input {...register('companyWebsite', { required: 'Website is required' })} className="input" placeholder="https://company.com" />
            {errors.companyWebsite && <span className="text-red-500 text-xs">{errors.companyWebsite.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Company Logo</label>
            <div className="flex items-center space-x-4">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="input" />
              {logoUploading && <span className="text-xs text-gray-500">Uploading...</span>}
              {logoUrl && (
                <img src={logoUrl} alt="Logo Preview" className="h-12 w-12 object-contain border rounded" />
              )}
            </div>
            <input type="hidden" {...register('companyLogo')} value={logoUrl} />
          </div>
          <div>
            <label className="block font-medium mb-1">Phone<span className="text-red-500">*</span></label>
            <input {...register('phone', { required: 'Phone is required' })} className="input" placeholder="Phone number" />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Address<span className="text-red-500">*</span></label>
            <input {...register('address', { required: 'Address is required' })} className="input" placeholder="Address" />
            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-2 rounded font-semibold mt-4">
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
} 