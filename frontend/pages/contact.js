import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaUser,
  FaBuilding,
  FaPaperPlane,
  FaCheckCircle,
  FaHeadset,
  FaComments,
  FaGlobe,
  FaArrowRight,
  FaStar,
  FaHeart
} from 'react-icons/fa';
import { api } from '../utils/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/contact', formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message sent successfully!');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email Us',
      value: 'contact@jobpulse.com',
      link: 'mailto:contact@jobpulse.com',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FaPhone,
      title: 'Call Us',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Visit Us',
      value: '123 Job Street, Career City, CC 12345',
      link: '#',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      value: 'Mon-Fri: 9AM-6PM EST',
      link: '#',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const departments = [
    {
      name: 'General Inquiries',
      email: 'contact@jobpulse.com',
      description: 'For general questions and support',
      icon: FaComments,
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Technical Support',
      email: 'support@jobpulse.com',
      description: 'For technical issues and bug reports',
      icon: FaHeadset,
      color: 'from-blue-500 to-purple-500'
    },
    {
      name: 'Sales & Partnerships',
      email: 'sales@jobpulse.com',
      description: 'For business partnerships and sales inquiries',
      icon: FaBuilding,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Employer Support',
      email: 'employers@jobpulse.com',
      description: 'For employer-specific questions and support',
      icon: FaGlobe,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  if (submitted) {
    return (
      <>
        <Head>
          <title>Contact Us - JobPulse</title>
          <meta name="description" content="Get in touch with JobPulse" />
        </Head>

        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
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

          <div className="relative z-10 max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Message Sent Successfully!
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Thank you for contacting us. We'll get back to you within 24 hours with a detailed response.
                </p>
                <motion.button
                  onClick={() => setSubmitted(false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
                >
                  Send Another Message
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Contact Us - JobPulse</title>
        <meta name="description" content="Get in touch with JobPulse" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          
          {/* Base Lighting Effects */}
          <motion.div
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-orange-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Orange Light Effects */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-400/15 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

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
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 w-4 h-4 bg-orange-400 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-3 h-3 bg-red-400 rounded-full"
          animate={{
            y: [0, 15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/3 left-10 w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="relative z-10 min-h-screen">
          {/* Hero Section */}
          <section className="relative py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8 group hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
                >
                  <FaHeart className="text-orange-400 w-5 h-5" />
                  <span className="text-white text-sm font-medium">
                    We're Here to Help
                  </span>
                </motion.div>

                <motion.h1 
                  className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="block"
                  >
                    Let's Start a
                  </motion.span>
                  <motion.span
                    className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Conversation
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Have a question, need support, or want to explore partnership opportunities? 
                  Our team is ready to assist you with personalized solutions and expert guidance.
                </motion.p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    <motion.h2 
                      className="text-3xl font-bold text-white mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      Send us a Message
                    </motion.h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.0 }}
                        >
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Name *
                          </label>
                          <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                              placeholder="Your full name"
                              required
                            />
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.1 }}
                        >
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Email *
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Subject *
                        </label>
                        <div className="relative">
                          <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                            placeholder="What's this about?"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 resize-none"
                          placeholder="Tell us how we can help you..."
                          required
                        ></textarea>
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold py-4 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex items-center justify-center group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                          <FaPaperPlane className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                        )}
                        {loading ? 'Sending...' : 'Send Message'}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="space-y-8"
                >
                  {/* Contact Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group"
                      >
                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl group-hover:shadow-xl transition-all duration-300">
                          <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <info.icon className="text-white text-xl" />
                          </div>
                          <h3 className="font-semibold text-white mb-2 text-sm">
                            {info.title}
                          </h3>
                          <a
                            href={info.link}
                            className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                          >
                            {info.value}
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Departments */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Departments
                      </h2>
                      <div className="space-y-4">
                        {departments.map((dept, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                            whileHover={{ x: 5 }}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-r ${dept.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <dept.icon className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-sm">
                                {dept.name}
                              </h3>
                              <p className="text-gray-400 text-xs mb-1">
                                {dept.description}
                              </p>
                              <a
                                href={`mailto:${dept.email}`}
                                className="text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors duration-300"
                              >
                                {dept.email}
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Office Hours */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                  >
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Office Hours
                      </h2>
                      <div className="space-y-3">
                        {[
                          { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
                          { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
                          { day: 'Sunday', hours: 'Closed' }
                        ].map((schedule, index) => (
                          <motion.div 
                            key={index}
                            className="flex justify-between items-center py-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1.9 + index * 0.1 }}
                          >
                            <span className="text-gray-300 text-sm">{schedule.day}</span>
                            <span className="font-medium text-white text-sm">{schedule.hours}</span>
                          </motion.div>
                        ))}
                      </div>
                      <motion.div 
                        className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 2.2 }}
                      >
                        <p className="text-sm text-orange-200">
                          <strong>Note:</strong> For urgent technical issues outside business hours, please email support@jobpulse.com and we'll respond as soon as possible.
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 