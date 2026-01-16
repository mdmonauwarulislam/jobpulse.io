import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaGavel, FaFileContract, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';

export default function Terms() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: FaFileContract,
      content: `By accessing and using JobPulse, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: 'User Accounts',
      icon: FaUserShield,
      content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.`
    },
    {
      title: 'Prohibited Uses',
      icon: FaExclamationTriangle,
      content: `You may not use our service for any illegal or unauthorized purpose. You must not transmit any worms, viruses or any code of a destructive nature.`
    },
    {
      title: 'Intellectual Property',
      icon: FaGavel,
      content: `The content on JobPulse, including text, graphics, images, and software, is the property of JobPulse and is protected by copyright laws.`
    }
  ];

  const userObligations = [
    'Provide accurate and complete information',
    'Maintain the security of your account',
    'Comply with all applicable laws',
    'Respect the rights of other users',
    'Report any violations or suspicious activity'
  ];

  const serviceLimitations = [
    'We do not guarantee job placement',
    'We are not responsible for hiring decisions',
    'Service availability may vary',
    'We reserve the right to modify services',
    'We may terminate accounts for violations'
  ];

  return (
    <>
      <Head>
        <title>Terms of Service - JobPulse</title>
        <meta name="description" content="Terms of service for JobPulse users" />
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
              <FaGavel className="text-6xl text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Please read these terms carefully before using our service.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="card-body p-8">
                  <div className="flex items-center mb-6">
                    <section.icon className="text-3xl text-primary-500 mr-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* User Obligations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  User Obligations
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      What You Must Do
                    </h3>
                    <ul className="space-y-3">
                      {userObligations.map((obligation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {obligation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Service Limitations
                    </h3>
                    <ul className="space-y-3">
                      {serviceLimitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Additional Terms
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Termination
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      We may terminate or suspend your account immediately, without prior notice or liability, 
                      for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Limitation of Liability
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      In no event shall JobPulse, nor its directors, employees, partners, agents, suppliers, 
                      or affiliates, be liable for any indirect, incidental, special, consequential, or 
                      punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                      or other intangible losses.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Governing Law
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
                      JobPulse operates, without regard to its conflict of law provisions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Changes to Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card bg-yellow-50 dark:bg-yellow-900/10"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Changes to Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will try to provide at least 30 days notice prior to any new 
                  terms taking effect.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  What constitutes a material change will be determined at our sole discretion. By continuing 
                  to access or use our Service after any revisions become effective, you agree to be bound by 
                  the revised terms.
                </p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Email
                    </h3>
                    <a 
                      href="mailto:legal@jobpulse.com" 
                      className="text-primary-600 hover:text-primary-500"
                    >
                      legal@jobpulse.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Address
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      123 Job Street<br />
                      Career City, CC 12345
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
} 