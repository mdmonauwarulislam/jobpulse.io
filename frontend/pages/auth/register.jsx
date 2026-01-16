import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaBuilding, FaPhone, FaMapMarkerAlt, FaBriefcase, FaRocket, FaShieldAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { api } from '../../utils/api';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('user');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const endpoint = userType === 'employer' ? '/auth/register-employer' : '/auth/register-user';
      
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      if (userType === 'employer') {
        payload.company = data.company;
      }

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        router.push('/auth/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FaRocket,
      title: "Fast & Easy",
      description: "Get started in minutes with our streamlined registration process"
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: FaUsers,
      title: "Join Thousands",
      description: "Connect with a growing community of professionals"
    }
  ];

  return (
    <>
      <Head>
        <title>Register - JobPulse</title>
        <meta name="description" content="Create your JobPulse account" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/2 via-red-500/1 to-orange-400/2"></div>
          
          {/* Animated Beam Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Beam 1 - Diagonal */}
            <motion.div
              className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-transparent via-orange-500/40 to-transparent blur"
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transform: "rotate(15deg) translateX(-50%)",
                left: "20%"
              }}
            />
            
            {/* Beam 2 - Horizontal */}
            <motion.div
              className="absolute top-1/3 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-red-500/40 to-transparent blur"
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            
            {/* Beam 3 - Vertical */}
            <motion.div
              className="absolute top-0 bottom-0 right-1/4 w-3 bg-gradient-to-b from-transparent via-orange-400/40 to-transparent blur"
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>
          
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Features */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center space-x-3 mb-6"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-2xl">
                      <FaBriefcase className="text-white text-xl" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      JobPulse
                    </span>
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-bold text-white leading-tight"
                  >
                    Start Your Journey
                    <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      With JobPulse
                    </span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-xl text-gray-300 leading-relaxed"
                  >
                    Join thousands of professionals and companies finding their perfect match. 
                    Create your account and unlock endless opportunities.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="space-y-6"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                        <feature.icon className="text-orange-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex items-center space-x-4 text-gray-400"
                >
                  <FaCheckCircle className="text-green-400 text-xl" />
                  <span className="text-sm">Free to join • No hidden fees</span>
                </motion.div>
              </motion.div>

              {/* Right Column - Registration Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
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
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                      <p className="text-gray-300">Join JobPulse and start your journey</p>
                    </div>

                    {/* User Type Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        I want to:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setUserType('user')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            userType === 'user'
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-600 hover:border-orange-500/50 text-gray-300 hover:text-orange-300'
                          }`}
                        >
                          <FaUser className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Find Jobs</span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setUserType('employer')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            userType === 'employer'
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-600 hover:border-orange-500/50 text-gray-300 hover:text-orange-300'
                          }`}
                        >
                          <FaBuilding className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Hire Talent</span>
                        </motion.button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          Name
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 transition duration-300"></div>
                          <div className="relative">
                            <input
                              {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                  value: 2,
                                  message: 'Name must be at least 2 characters',
                                },
                              })}
                              type="text"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                              placeholder="Enter your name"
                            />
                          </div>
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                        )}
                      </div>
                      {/* Company Name Field for Employer */}
                      {userType === 'employer' && (
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                            Company Name
                          </label>
                          <div className="relative">
                            <input
                              {...register('company', {
                                required: 'Company name is required',
                                minLength: { value: 2, message: 'Company name must be at least 2 characters' },
                              })}
                              type="text"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                              placeholder="Enter your company name"
                            />
                          </div>
                          {errors.company && (
                            <p className="mt-1 text-sm text-red-400">{errors.company.message}</p>
                          )}
                        </div>
                      )}

                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 transition duration-300"></div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'Invalid email address',
                                },
                              })}
                              type="email"
                              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 transition duration-300"></div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                  value: 8,
                                  message: 'Password must be at least 8 characters',
                                },
                                pattern: {
                                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                                },
                              })}
                              type={showPassword ? 'text' : 'password'}
                              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                              placeholder="Create a strong password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                              {showPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                              ) : (
                                <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                              )}
                            </button>
                          </div>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 transition duration-300"></div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === password || 'Passwords do not match',
                              })}
                              type={showConfirmPassword ? 'text' : 'password'}
                              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                              {showConfirmPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                              ) : (
                                <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                              )}
                            </button>
                          </div>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                        )}
                      </div>

                      {/* Terms and Conditions */}
                      <div className="flex items-start">
                        <input
                          {...register('terms', {
                            required: 'You must accept the terms and conditions',
                          })}
                          type="checkbox"
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded mt-1 bg-white/10"
                        />
                        <label className="ml-2 block text-sm text-gray-300">
                          I agree to the{' '}
                          <Link href="/terms" className="text-orange-400 hover:text-orange-300 transition-colors">
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                      {errors.terms && (
                        <p className="mt-1 text-sm text-red-400">{errors.terms.message}</p>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating Account...
                          </div>
                        ) : (
                          `Create ${userType === 'employer' ? 'Employer' : 'Job Seeker'} Account`
                        )}
                      </motion.button>
                    </form>

                    {/* Sign In Link */}
                    <div className="text-center mt-6">
                      <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link
                          href="/auth/login"
                          className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 