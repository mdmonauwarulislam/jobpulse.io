import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBriefcase, FaRocket, FaStar, FaArrowRight } from 'react-icons/fa';

export default function CompleteProfile() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: user?.phone || '',
      address: user?.address || '',
      summary: user?.summary || '',
      education: user?.education && user.education.length > 0 ? user.education : [{ degree: '', institution: '', year: '', description: '' }],
      experience: user?.experience && user.experience.length > 0 ? user.experience : [{ jobTitle: '', company: '', duration: '', description: '' }],
      skills: user?.skills && user.skills.length > 0 ? user.skills : [''],
      resumeUrl: user?.resumeUrl || '',
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' });

  if (!user) {
    if (typeof window !== 'undefined') router.replace('/auth/login');
    return null;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/complete-profile', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser({ isProfileComplete: true, ...data });
      toast.success(user.isProfileComplete ? 'Profile updated!' : 'Profile completed!');
      router.push('/user/profile');
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FaBriefcase, text: 'Showcase Your Skills', color: 'from-orange-500 to-red-500' },
    { icon: FaRocket, text: 'Stand Out to Employers', color: 'from-red-500 to-orange-500' },
    { icon: FaStar, text: 'Unlock More Opportunities', color: 'from-orange-400 to-red-400' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Profile Completion Progress */}
      <div className="relative z-20 w-full max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">Profile Completion</span>
          <span className="text-orange-400 font-bold">{user.profileCompletion ?? 0}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-4 mb-6">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${user.profileCompletion ?? 0}%` }}
          ></div>
        </div>
      </div>
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
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur opacity-0 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-2 text-center text-white">
                {user.isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h2>
              <p className="text-center text-gray-300 mb-6">
                {user.isProfileComplete ? 'Update your profile information below.' : 'Fill out your details to unlock personalized job recommendations.'}
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1 text-white">Phone</label>
                    <input {...register('phone')} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300" placeholder="Phone number" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Address</label>
                    <input {...register('address')} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300" placeholder="Address" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Summary</label>
                    <textarea {...register('summary')} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300" placeholder="Short summary" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Education</label>
                    {eduFields.map((field, idx) => (
                      <div key={field.id} className="mb-2 border border-white/10 p-2 rounded bg-white/5">
                        <input {...register(`education.${idx}.degree`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.education?.[idx]?.degree ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Degree *" />
                        <input {...register(`education.${idx}.institution`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.education?.[idx]?.institution ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Institution *" />
                        <input {...register(`education.${idx}.year`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.education?.[idx]?.year ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Year *" />
                        <input {...register(`education.${idx}.description`)} className="w-full px-3 py-2 mb-1 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400" placeholder="Description" />
                        <button type="button" onClick={() => removeEdu(idx)} className="text-red-400 text-xs mt-1">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendEdu({ degree: '', institution: '', year: '', description: '' })} className="text-orange-400 text-xs mt-1">+ Add Education</button>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Experience</label>
                    {expFields.map((field, idx) => (
                      <div key={field.id} className="mb-2 border border-white/10 p-2 rounded bg-white/5">
                        <input {...register(`experience.${idx}.jobTitle`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.experience?.[idx]?.jobTitle ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Job Title *" />
                        <input {...register(`experience.${idx}.company`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.experience?.[idx]?.company ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Company *" />
                        <input {...register(`experience.${idx}.duration`, { required: true })} className={`w-full px-3 py-2 mb-1 bg-white/10 border ${errors.experience?.[idx]?.duration ? 'border-red-500' : 'border-white/20'} rounded text-white placeholder-gray-400`} placeholder="Duration *" />
                        <input {...register(`experience.${idx}.description`)} className="w-full px-3 py-2 mb-1 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400" placeholder="Description" />
                        <button type="button" onClick={() => removeExp(idx)} className="text-red-400 text-xs mt-1">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendExp({ jobTitle: '', company: '', duration: '', description: '' })} className="text-orange-400 text-xs mt-1">+ Add Experience</button>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Skills</label>
                    {skillFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center mb-1">
                        <input {...register(`skills.${idx}`)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400" placeholder="Skill" />
                        <button type="button" onClick={() => removeSkill(idx)} className="text-red-400 text-xs ml-2">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendSkill('')} className="text-orange-400 text-xs mt-1">+ Add Skill</button>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-white">Resume URL</label>
                    <input {...register('resumeUrl')} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300" placeholder="Link to your resume (optional)" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold mt-4 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex justify-center items-center">
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <span className="flex items-center">
                        {user.isProfileComplete ? 'Update Profile' : 'Complete Profile'}
                        <FaArrowRight className="ml-2" />
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
  );
} 