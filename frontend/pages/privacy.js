import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaShield, FaEye, FaLock, FaUserCheck } from 'react-icons/fa';

export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: FaEye,
      content: [
        'Personal information (name, email, phone number)',
        'Professional information (resume, work history, skills)',
        'Account credentials and preferences',
        'Usage data and analytics',
        'Communication records with our platform'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: FaUserCheck,
      content: [
        'To provide and maintain our services',
        'To match you with relevant job opportunities',
        'To communicate with you about your account',
        'To improve our platform and user experience',
        'To send you relevant job alerts and updates'
      ]
    },
    {
      title: 'Information Sharing',
      icon: FaShield,
      content: [
        'We do not sell your personal information',
        'We may share information with employers when you apply',
        'We use trusted third-party services for platform functionality',
        'We may disclose information if required by law',
        'We protect your information with industry-standard security'
      ]
    },
    {
      title: 'Data Security',
      icon: FaLock,
      content: [
        'Encryption of sensitive data in transit and at rest',
        'Regular security audits and updates',
        'Access controls and authentication measures',
        'Secure data centers and infrastructure',
        'Employee training on data protection'
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy - JobPulse</title>
        <meta name="description" content="Learn about how JobPulse protects your privacy and data" />
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
              <FaShield className="text-6xl text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          {/* Policy Sections */}
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
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Your Rights and Choices
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Access and Control
                    </h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• View and update your personal information</li>
                      <li>• Download your data</li>
                      <li>• Delete your account</li>
                      <li>• Opt out of marketing communications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Data Retention
                    </h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• We retain data as long as your account is active</li>
                      <li>• Deleted accounts are purged within 30 days</li>
                      <li>• Some data may be retained for legal compliance</li>
                      <li>• You can request data deletion at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card bg-primary-50 dark:bg-primary-900/10"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Email
                    </h3>
                    <a 
                      href="mailto:privacy@jobpulse.com" 
                      className="text-primary-600 hover:text-primary-500"
                    >
                      privacy@jobpulse.com
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