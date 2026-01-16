import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaSearch, 
  FaUser, 
  FaBriefcase, 
  FaBuilding,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaMobileAlt,
  FaEnvelope,
  FaArrowRight,
  FaStar,
  FaRocket
} from 'react-icons/fa';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is JobPulse?',
          answer: 'JobPulse is a comprehensive job board platform that connects job seekers with employers. We provide tools for posting jobs, applying to positions, and managing the entire hiring process with advanced features and modern technology.',
          icon: FaBriefcase
        },
        {
          question: 'Is JobPulse free to use?',
          answer: 'JobPulse offers both free and premium features. Job seekers can browse and apply to jobs for free, while employers have various pricing tiers for posting jobs and accessing advanced features.',
          icon: FaShieldAlt
        },
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top navigation and choose whether you\'re a job seeker or employer. Fill out the registration form with your information and verify your email address.',
          icon: FaUser
        },
        {
          question: 'What browsers are supported?',
          answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.',
          icon: FaMobileAlt
        }
      ]
    },
    {
      category: 'For Job Seekers',
      questions: [
        {
          question: 'How do I apply for a job?',
          answer: 'Browse jobs on the Jobs page, click on a job that interests you, and click the "Apply Now" button. You can upload your resume and write a cover letter during the application process.',
          icon: FaUser
        },
        {
          question: 'Can I upload my resume?',
          answer: 'Yes! You can upload your resume when applying for jobs or in your profile settings. We support PDF, DOC, and DOCX formats up to 5MB.',
          icon: FaBriefcase
        },
        {
          question: 'How do I track my applications?',
          answer: 'Log into your account and go to your dashboard. You\'ll find all your applications with their current status under the "Applications" tab.',
          icon: FaRocket
        },
        {
          question: 'How do I set up job alerts?',
          answer: 'Go to your profile settings and enable job alerts. You can customize the types of jobs you want to be notified about based on location, industry, and keywords.',
          icon: FaEnvelope
        },
        {
          question: 'Can I save jobs for later?',
          answer: 'Yes! You can save jobs by clicking the bookmark icon on any job listing. Saved jobs can be found in your dashboard under "Saved Jobs".',
          icon: FaStar
        }
      ]
    },
    {
      category: 'For Employers',
      questions: [
        {
          question: 'How do I post a job?',
          answer: 'Register as an employer, then go to your dashboard and click "Post New Job". Fill out the job details form with all required information and submit for review.',
          icon: FaBuilding
        },
        {
          question: 'How much does it cost to post a job?',
          answer: 'We offer various pricing plans starting from basic job postings to premium packages with advanced features. Contact our sales team for detailed pricing information.',
          icon: FaShieldAlt
        },
        {
          question: 'How do I review applications?',
          answer: 'Log into your employer dashboard and go to the "Applications" section. You can view, accept, reject, or contact applicants directly from there.',
          icon: FaUser
        },
        {
          question: 'Can I edit a job posting?',
          answer: 'Yes! Go to your job management page and click "Edit" on any job posting. You can modify all details before republishing the job.',
          icon: FaBriefcase
        },
        {
          question: 'How do I contact applicants?',
          answer: 'You can contact applicants directly through our messaging system in your dashboard, or use the contact information they provided in their application.',
          icon: FaEnvelope
        }
      ]
    },
    {
      category: 'Account & Settings',
      questions: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Security and enter your current password along with your new password to update it.',
          icon: FaShieldAlt
        },
        {
          question: 'How do I update my profile?',
          answer: 'Go to Settings > Profile to update your personal information, contact details, and preferences.',
          icon: FaUser
        },
        {
          question: 'How do I manage notifications?',
          answer: 'Go to Settings > Notifications to customize which notifications you receive via email and in-app.',
          icon: FaEnvelope
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account in Settings. Please note that this action is irreversible and will remove all your data.',
          icon: FaShieldAlt
        },
        {
          question: 'What if I forgot my password?',
          answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a reset link to create a new password.',
          icon: FaUser
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information and data. We regularly conduct security audits and updates.',
          icon: FaShieldAlt
        },
        {
          question: 'How do I report a bug?',
          answer: 'Contact our support team with details about the issue you\'re experiencing. Include your browser and device information for faster resolution.',
          icon: FaEnvelope
        },
        {
          question: 'What file formats are supported for resumes?',
          answer: 'We support PDF, DOC, and DOCX formats for resume uploads. Files must be under 5MB in size.',
          icon: FaBriefcase
        },
        {
          question: 'Is JobPulse mobile-friendly?',
          answer: 'Yes! JobPulse is fully responsive and works great on mobile devices. You can browse jobs, apply, and manage your account from your phone or tablet.',
          icon: FaMobileAlt
        },
        {
          question: 'How do I contact support?',
          answer: 'You can contact our support team via email at support@jobpulse.com, phone at +1 (555) 123-4567, or through our live chat feature.',
          icon: FaEnvelope
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: FaQuestionCircle, color: 'from-orange-500 to-red-500' },
    { id: 'job-seekers', label: 'Job Seekers', icon: FaUser, color: 'from-blue-500 to-purple-500' },
    { id: 'employers', label: 'Employers', icon: FaBuilding, color: 'from-green-500 to-teal-500' },
    { id: 'general', label: 'General', icon: FaBriefcase, color: 'from-purple-500 to-pink-500' },
    { id: 'technical', label: 'Technical', icon: FaMobileAlt, color: 'from-indigo-500 to-blue-500' }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      (selectedCategory === 'all' || 
       (selectedCategory === 'job-seekers' && category.category === 'For Job Seekers') ||
       (selectedCategory === 'employers' && category.category === 'For Employers') ||
       (selectedCategory === 'general' && category.category === 'General') ||
       (selectedCategory === 'technical' && category.category === 'Technical Support')) &&
      (q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
       q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>FAQ - JobPulse</title>
        <meta name="description" content="Frequently asked questions about JobPulse" />
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
            
            {/* Beam 4 - Diagonal Reverse */}
            <motion.div
              className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-transparent via-red-400/60 to-transparent blur"
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              style={{
                transform: "rotate(-15deg) translateX(50%)",
                right: "30%"
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

        <div className="container-custom py-16 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8"
            >
              <FaQuestionCircle className="text-orange-400 text-sm" />
              <span className="text-white text-sm font-medium">
                Got Questions?
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Frequently Asked
              </span>
              <br />
              <span className="text-white">Questions</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Find answers to the most common questions about JobPulse and how we can help you succeed in your career journey.
            </motion.p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative group px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r ' + category.color + ' border-white/30 text-white shadow-2xl'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="text-lg" />
                  <span className="font-medium">{category.label}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="max-w-4xl mx-auto"
          >
            {filteredFaqs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-full p-8 inline-block">
                    <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  No questions found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Try adjusting your search terms or browse all categories above.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {filteredFaqs.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    className="mb-12"
                  >
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 + 0.2 }}
                      className="text-3xl font-bold text-white mb-8 flex items-center"
                    >
                      <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        {category.category}
                      </span>
                    </motion.h2>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const index = `${categoryIndex}-${faqIndex}`;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: (categoryIndex * 0.1) + (faqIndex * 0.05) }}
                            whileHover={{ y: -2, scale: 1.01 }}
                            className="relative group"
                          >
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <motion.div
                              className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500 overflow-hidden"
                              whileHover={{
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                              }}
                            >
                              {/* Animated Background Pattern */}
                              <div className="absolute inset-0 overflow-hidden">
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-500/5"
                                  animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: (categoryIndex * 0.2) + (faqIndex * 0.1),
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                              </div>

                              <div className="relative z-10">
                                <button
                                  onClick={() => toggleFaq(index)}
                                  className="w-full px-8 py-6 text-left flex items-center justify-between group/button"
                                >
                                  <div className="flex items-center space-x-4">
                                    <motion.div
                                      className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <faq.icon className="text-white text-lg" />
                                    </motion.div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors duration-300">
                                        {faq.question}
                                      </h3>
                                      <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                        {category.category}
                                      </span>
                                    </div>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-gray-400 group-hover:text-orange-400 transition-colors duration-300"
                                  >
                                    {expandedFaq === index ? (
                                      <FaChevronUp className="w-5 h-5" />
                                    ) : (
                                      <FaChevronDown className="w-5 h-5" />
                                    )}
                                  </motion.div>
                                </button>

                                <motion.div
                                  initial={false}
                                  animate={{
                                    height: expandedFaq === index ? "auto" : 0,
                                    opacity: expandedFaq === index ? 1 : 0,
                                  }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-8 pb-6">
                                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mb-6"></div>
                                    <motion.p
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{
                                        opacity: expandedFaq === index ? 1 : 0,
                                        y: expandedFaq === index ? 0 : 10,
                                      }}
                                      transition={{ duration: 0.3, delay: 0.1 }}
                                      className="text-gray-300 leading-relaxed"
                                    >
                                      {faq.answer}
                                    </motion.p>
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-20"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-6"
                >
                  <FaEnvelope className="text-white text-2xl" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Still Need Help?
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Can't find the answer you're looking for? Our support team is here to help you with any questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
                  >
                    <span>Contact Support</span>
                    <FaArrowRight className="ml-3" />
                  </motion.a>
                  <motion.a
                    href="/help"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl text-white text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-white/10"
                  >
                    <span>Help Center</span>
                    <FaArrowRight className="ml-3" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 