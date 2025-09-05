import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, 
  FaUsers, 
  FaRocket, 
  FaHeart,
  FaAward,
  FaGlobe,
  FaLightbulb,
  FaHandshake,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope
} from 'react-icons/fa';

export default function About() {
  const stats = [
    { number: '10,000+', label: 'Jobs Posted', icon: FaBriefcase, color: 'from-orange-500 to-red-500' },
    { number: '50,000+', label: 'Active Users', icon: FaUsers, color: 'from-blue-500 to-purple-500' },
    { number: '95%', label: 'Success Rate', icon: FaAward, color: 'from-green-500 to-emerald-500' },
    { number: '24/7', label: 'Support', icon: FaGlobe, color: 'from-purple-500 to-pink-500' }
  ];

  const values = [
    {
      icon: FaHeart,
      title: 'Passion',
      description: 'We\'re passionate about connecting talented individuals with amazing opportunities.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: FaHandshake,
      title: 'Trust',
      description: 'Building lasting relationships through transparency and reliability.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: FaRocket,
      title: 'Growth',
      description: 'Supporting both job seekers and employers in their journey to success.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/images/team/sarah.jpg',
      bio: 'Former HR executive with 15+ years in talent acquisition.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/images/team/michael.jpg',
      bio: 'Tech leader with expertise in scalable platforms and AI.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: '/images/team/emily.jpg',
      bio: 'Product strategist focused on user experience and growth.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    },
    {
      name: 'David Thompson',
      role: 'Head of Sales',
      image: '/images/team/david.jpg',
      bio: 'Sales leader with deep understanding of employer needs.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - JobPulse</title>
        <meta name="description" content="Learn about JobPulse and our mission to connect talent with opportunity" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          
          {/* Base Lighting Effects - Similar to home page */}
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

        {/* Floating Elements - Like home page */}
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
          <section className="relative min-h-screen flex items-center overflow-hidden py-20">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-7xl mx-auto"
              >
                <div className="relative  backdrop-blur-xl  p-12 shadow-2xl">
                  <motion.h1 
                    className="text-6xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="block"
                    >
                      Connecting Talent with
                    </motion.span>
                    <motion.span
                      className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      Opportunity
                    </motion.span>
                  </motion.h1>
                  
                  <motion.p 
                    className="text-xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    JobPulse is more than just a job board. We're a platform that empowers individuals 
                    to find their dream careers and helps companies discover exceptional talent through 
                    innovative technology and human-centered design.
                  </motion.p>

                  {/* Stats Grid */}
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="text-center group"
                      >
                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl group-hover:shadow-xl transition-all duration-300">
                          <motion.div 
                            className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <stat.icon className="text-2xl text-white" />
                          </motion.div>
                          <motion.div 
                            className="text-3xl font-bold text-white mb-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {stat.number}
                          </motion.div>
                          <div className="text-gray-300 text-sm">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

              
                </div>
              </motion.div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            {/* Mission Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.h2 
                    className="text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    Our Mission
                  </motion.h2>
                  <motion.p 
                    className="text-lg text-gray-300 mb-6 leading-relaxed"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    We believe that everyone deserves to find meaningful work that aligns with their 
                    passions and skills. Our mission is to create a seamless, efficient, and 
                    user-friendly platform that connects talented individuals with companies that 
                    value their contributions.
                  </motion.p>
                  <motion.p 
                    className="text-lg text-gray-300 mb-8 leading-relaxed"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    For job seekers, we provide access to thousands of opportunities across various 
                    industries and locations. For employers, we offer powerful tools to find and 
                    connect with the best candidates for their organizations.
                  </motion.p>
                  <motion.div 
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <FaRocket className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        Driving Innovation
                      </h3>
                      <p className="text-gray-300">
                        Continuously improving our platform with the latest technology
                      </p>
                    </div>
                  </motion.div>
                </div>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6">Why Choose JobPulse?</h3>
                    <ul className="space-y-4">
                      {[
                        'Advanced matching algorithms',
                        'Comprehensive employer tools',
                        'Real-time application tracking',
                        '24/7 customer support',
                        'Mobile-optimized experience'
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-center text-gray-300"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <FaCheckCircle className="mr-3 text-green-400 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Values Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="text-center mb-12">
                <motion.h2 
                  className="text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Our Values
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-300 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  These core values guide everything we do and shape our company culture.
                </motion.p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 text-center">
                      {value.title}
                    </h3>
                    <p className="text-gray-300 text-center">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Team Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="text-center mb-12">
                <motion.h2 
                  className="text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Meet Our Team
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-300 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Our leadership team brings together decades of experience in technology, 
                  human resources, and business development.
                </motion.p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {member.name}
                      </h3>
                      <p className="text-orange-400 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-gray-300 text-sm mb-4">
                        {member.bio}
                      </p>
                      <div className="flex justify-center space-x-3">
                        <a href={member.social.linkedin} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <FaLinkedin className="text-gray-300 w-4 h-4" />
                        </a>
                        <a href={member.social.twitter} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <FaTwitter className="text-gray-300 w-4 h-4" />
                        </a>
                        <a href={member.social.github} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <FaGithub className="text-gray-300 w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl">
                <motion.h2 
                  className="text-4xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Ready to Get Started?
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Join thousands of job seekers and employers who trust JobPulse to connect talent with opportunity.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25">
                    Browse Jobs
                    <FaArrowRight className="ml-2" />
                  </button>
                  <button className="inline-flex items-center px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300">
                    <FaEnvelope className="mr-2" />
                    Contact Us
                  </button>
                </motion.div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
} 