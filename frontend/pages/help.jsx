import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaSearch, 
  FaUser, 
  FaBriefcase, 
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      category: 'For Job Seekers',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top navigation and fill out the registration form. You can register as either a job seeker or an employer.'
        },
        {
          question: 'How do I apply for a job?',
          answer: 'Browse jobs on the Jobs page, click on a job that interests you, and click the "Apply Now" button. You can upload your resume and write a cover letter.'
        },
        {
          question: 'How do I track my applications?',
          answer: 'Log into your account and go to your dashboard. You\'ll find all your applications with their current status under the "Applications" tab.'
        },
        {
          question: 'Can I upload my resume?',
          answer: 'Yes! You can upload your resume when applying for jobs or in your profile settings. We support PDF, DOC, and DOCX formats up to 5MB.'
        }
      ]
    },
    {
      category: 'For Employers',
      questions: [
        {
          question: 'How do I post a job?',
          answer: 'Register as an employer, then go to your dashboard and click "Post New Job". Fill out the job details form and submit.'
        },
        {
          question: 'How much does it cost to post a job?',
          answer: 'We offer various pricing plans. Contact our sales team for detailed pricing information and to discuss your hiring needs.'
        },
        {
          question: 'How do I review applications?',
          answer: 'Log into your employer dashboard and go to the "Applications" section. You can view, accept, or reject applications from there.'
        },
        {
          question: 'Can I edit a job posting?',
          answer: 'Yes! Go to your job management page and click "Edit" on any job posting. You can modify all details before republishing.'
        }
      ]
    },
    {
      category: 'Account & Settings',
      questions: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Security and enter your current password along with your new password to update it.'
        },
        {
          question: 'How do I update my profile?',
          answer: 'Go to Settings > Profile to update your personal information, contact details, and preferences.'
        },
        {
          question: 'How do I manage notifications?',
          answer: 'Go to Settings > Notifications to customize which notifications you receive via email and in-app.'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account in Settings. Please note that this action is irreversible and will remove all your data.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'What browsers are supported?',
          answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information and data.'
        },
        {
          question: 'What if I forgot my password?',
          answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a reset link.'
        },
        {
          question: 'How do I report a bug?',
          answer: 'Contact our support team with details about the issue you\'re experiencing. Include your browser and device information.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Help Center - JobPulse</title>
        <meta name="description" content="Get help and support for JobPulse" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <FaQuestionCircle className="text-6xl text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions and get the support you need
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="card text-center hover-lift">
              <div className="card-body p-6">
                <FaUser className="text-4xl text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  For Job Seekers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Learn how to find and apply for jobs
                </p>
                <a href="#job-seekers" className="text-primary-600 hover:text-primary-500 font-medium">
                  Get Started →
                </a>
              </div>
            </div>

            <div className="card text-center hover-lift">
              <div className="card-body p-6">
                <FaBuilding className="text-4xl text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  For Employers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Learn how to post jobs and manage applications
                </p>
                <a href="#employers" className="text-primary-600 hover:text-primary-500 font-medium">
                  Get Started →
                </a>
              </div>
            </div>

            <div className="card text-center hover-lift">
              <div className="card-body p-6">
                <FaBriefcase className="text-4xl text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Account Help
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage your account and settings
                </p>
                <a href="#account" className="text-primary-600 hover:text-primary-500 font-medium">
                  Get Started →
                </a>
              </div>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={category.category} id={category.category.toLowerCase().replace(' ', '-')}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const index = `${categoryIndex}-${faqIndex}`;
                    return (
                      <div key={index} className="card">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full text-left p-6 focus:outline-none"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {faq.question}
                            </h3>
                            {expandedFaq === index ? (
                              <FaChevronUp className="text-gray-400" />
                            ) : (
                              <FaChevronDown className="text-gray-400" />
                            )}
                          </div>
                        </button>
                        {expandedFaq === index && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16"
          >
            <div className="card">
              <div className="card-body p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Still Need Help?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you with any questions or issues.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-center space-x-3">
                    <FaEnvelope className="text-primary-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">support@jobpulse.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <FaPhone className="text-primary-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Phone Support</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <FaQuestionCircle className="text-primary-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn-primary">
                    Contact Support
                  </a>
                  <a href="mailto:support@jobpulse.com" className="btn-outline">
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 