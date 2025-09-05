import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaGlobe,
  FaDownload,
  FaMobileAlt
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'For Job Seekers': [
      { name: 'Browse Jobs', href: '/jobs', icon: FaBriefcase },
      { name: 'Create Profile', href: '/auth/register', icon: FaUsers },
      { name: 'Career Advice', href: '/career-advice', icon: FaRocket },
      { name: 'Salary Guide', href: '/salary-guide', icon: FaShieldAlt },
    ],
    'For Employers': [
      { name: 'Post a Job', href: '/employer/post-job', icon: FaBriefcase },
      { name: 'Browse Candidates', href: '/employer/candidates', icon: FaUsers },
      { name: 'Pricing', href: '/pricing', icon: FaShieldAlt },
      { name: 'Employer Resources', href: '/employer-resources', icon: FaRocket },
    ],
    'Company': [
      { name: 'About Us', href: '/about', icon: FaUsers },
      { name: 'Contact', href: '/contact', icon: FaEnvelope },
      { name: 'Privacy Policy', href: '/privacy', icon: FaShieldAlt },
      { name: 'Terms of Service', href: '/terms', icon: FaShieldAlt },
    ],
    'Support': [
      { name: 'Help Center', href: '/help', icon: FaRocket },
      { name: 'Contact Support', href: '/contact', icon: FaEnvelope },
      { name: 'FAQ', href: '/faq', icon: FaBriefcase },
      { name: 'Report Issue', href: '/report', icon: FaShieldAlt },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: FaFacebook, color: 'hover:text-blue-400' },
    { name: 'Twitter', href: '#', icon: FaTwitter, color: 'hover:text-blue-400' },
    { name: 'LinkedIn', href: '#', icon: FaLinkedin, color: 'hover:text-blue-600' },
    { name: 'Instagram', href: '#', icon: FaInstagram, color: 'hover:text-pink-400' },
  ];

  const contactInfo = [
    { icon: FaEnvelope, text: 'contact@jobpulse.com', href: 'mailto:contact@jobpulse.com' },
    { icon: FaPhone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: FaMapMarkerAlt, text: '123 Job Street, Career City, CC 12345', href: '#' },
  ];

  const quickActions = [
    { icon: FaDownload, text: 'Download App', href: '#', color: 'from-orange-500 to-red-500' },
    { icon: FaMobileAlt, text: 'Mobile Version', href: '#', color: 'from-red-500 to-orange-500' },
    { icon: FaGlobe, text: 'Global Jobs', href: '#', color: 'from-orange-400 to-red-400' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Unique Background Pattern */}
      <div className="absolute inset-0">
        {/* Diagonal Stripes */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(249, 115, 22, 0.1) 10px,
              rgba(249, 115, 22, 0.1) 20px
            )`,
          }}></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/3 to-orange-400/5"></div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-1 h-1 bg-orange-400 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-0.5 h-0.5 bg-red-400 rounded-full"
          animate={{
            y: [0, 10, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-1 h-1 bg-orange-300 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container-custom py-20 relative z-10">
       

          

         

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBriefcase className="text-white text-xl" />
                </motion.div>
                <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  JobPulse
                </span>
              </Link>
            </motion.div>
            
            <motion.p 
              className="text-gray-300 mb-8 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Connect with top companies and find your dream job. JobPulse makes job searching 
              and hiring simple, efficient, and effective with our modern platform.
            </motion.p>
            
            {/* Contact Info */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-orange-400 transition-colors duration-300 group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-lg flex items-center justify-center border border-orange-500/30"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <contact.icon className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm">{contact.text}</span>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.h3 
                className="text-lg font-semibold mb-6 text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                {category}
              </motion.h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (linkIndex * 0.05) }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-colors duration-300 group"
                      >
                        <motion.div
                          className="w-6 h-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-md flex items-center justify-center border border-orange-500/30"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <link.icon className="w-3 h-3" />
                        </motion.div>
                        <span className="text-sm">{link.name}</span>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ x: -5 }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FaArrowRight className="w-3 h-3" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="mt-16 pt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="text-gray-400 text-sm mb-6 md:mb-0 flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <span>© {currentYear} JobPulse. All rights reserved.</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-red-400"
              >
                <FaHeart className="w-3 h-3" />
              </motion.div>
            </motion.div>
            
            {/* Social Links */}
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`text-gray-300 ${social.color} transition-all duration-300 p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110`}
                  aria-label={social.name}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 