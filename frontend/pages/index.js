import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaBriefcase,
  FaBuilding,
  FaUsers,
  FaRocket,
  FaArrowRight,
  FaStar,
  FaMapMarkerAlt,
  FaPlay,
  FaHeart,
  FaEye,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaShieldAlt,
  FaMobileAlt,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import JobCard from "../components/JobCard";
import Image from "next/image";


export default function Home() {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, statsResponse] = await Promise.all([
          api.get("/jobs/featured?limit=6"),
          api.get("/jobs?limit=1"), // We'll use this to get total count
        ]);

        setFeaturedJobs(jobsResponse.data.data.jobs || []);

        // Mock stats for now - in real app, you'd have a stats endpoint
        setStats({
          totalJobs: 1250,
          totalCompanies: 85,
          totalUsers: 3200,
          totalApplications: 8900,
        });
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: FaSearch,
      title: "Smart Job Search",
      description:
        "Find your perfect job with our advanced search and filtering system.",
    },
    {
      icon: FaBriefcase,
      title: "Easy Applications",
      description:
        "Apply to jobs with just one click using our streamlined application process.",
    },
    {
      icon: FaBuilding,
      title: "Top Companies",
      description:
        "Connect with leading companies and startups from around the world.",
    },
    {
      icon: FaUsers,
      title: "Career Growth",
      description:
        "Build your professional network and advance your career with us.",
    },
  ];

  const statsData = [
    { label: "Active Jobs", value: stats.totalJobs, icon: FaBriefcase },
    { label: "Companies", value: stats.totalCompanies, icon: FaBuilding },
    { label: "Job Seekers", value: stats.totalUsers, icon: FaUsers },
    { label: "Applications", value: stats.totalApplications, icon: FaRocket },
  ];

  // Mock job cards for hero section
  const heroJobCards = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      salary: "₹ 15 - 20",
      type: "Full Time",
      logo: "TC",
    },
    {
      id: 2,
      title: "Product Manager",
      company: "InnovateLab",
      location: "New York, NY",
      salary: "₹ 45 - 50",
      type: "Full Time",
      logo: "IL",
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignStudio",
      location: "Remote",
      salary: "$90k - $120k",
      type: "Full Time",
      logo: "DS",
    },
  ];

  // Company logos for hero section
  const companyLogos = [
    { name: "Google", logo: "/images/company-logo/google-icon-logo-svgrepo-com.svg" },
    { name: "Apple", logo: "/images/company-logo/apple-logo-svgrepo-com.svg" },
    { name: "OLA Cabs", logo: "/images/company-logo/ola-cabs-logo-svgrepo-com.svg" },
    { name: "Airbnb", logo: "/images/company-logo/airbnb-2-logo-svgrepo-com.svg" },
    { name: "BMW", logo: "/images/company-logo/bmw-logo-svgrepo-com.svg" },
    { name: "Coca-Cola", logo: "/images/company-logo/coca-cola-logo-svgrepo-com.svg" },
    { name: "Chanel", logo: "/images/company-logo/chanel-2-logo-svgrepo-com.svg" },
    { name: "Heineken", logo: "/images/company-logo/heineken-14-logo-svgrepo-com.svg" },
    { name: "Instagram", logo: "/images/company-logo/instagram-2-1-logo-svgrepo-com.svg" },
    { name: "Mastercard", logo: "/images/company-logo/mastercard-2-logo-svgrepo-com.svg" },
    { name: "McDonald's", logo: "/images/company-logo/mcdonald-s-15-logo-svgrepo-com.svg" },
    { name: "Microsoft", logo: "/images/company-logo/microsoft-logo-svgrepo-com.svg" },
    { name: "SoundCloud", logo: "/images/company-logo/soundcloud-logo-svgrepo-com.svg" },
    { name: "Spotify", logo: "/images/company-logo/spotify-1-logo-svgrepo-com.svg" },
  ];

  // FAQ Data
  const faqs = [
    {
      question: "What is JobPulse?",
      answer: "JobPulse is a comprehensive job board platform that connects job seekers with employers. We provide tools for posting jobs, applying to positions, and managing the entire hiring process with advanced features and modern technology.",
      icon: FaBriefcase,
      category: "General"
    },
    {
      question: "How do I apply for a job?",
      answer: "Browse jobs on our platform, click on a job that interests you, and click the 'Apply Now' button. You can upload your resume and write a cover letter during the streamlined application process.",
      icon: FaUser,
      category: "Job Seekers"
    },
    {
      question: "Is JobPulse free to use?",
      answer: "JobPulse offers both free and premium features. Job seekers can browse and apply to jobs for free, while employers have various pricing tiers for posting jobs and accessing advanced features.",
      icon: FaShieldAlt,
      category: "General"
    },
    {
      question: "How do I post a job as an employer?",
      answer: "Register as an employer, then go to your dashboard and click 'Post New Job'. Fill out the job details form with all required information and submit for review. Our platform makes it easy to reach qualified candidates.",
      icon: FaBuilding,
      category: "Employers"
    },
    {
      question: "Is JobPulse mobile-friendly?",
      answer: "Yes! JobPulse is fully responsive and works great on mobile devices. You can browse jobs, apply, and manage your account from your phone or tablet with our optimized mobile experience.",
      icon: FaMobileAlt,
      category: "Technical"
    },
    {
      question: "How do I contact support?",
      answer: "You can contact our support team via email at support@jobpulse.com, phone at +1 (555) 123-4567, or through our live chat feature. We're here to help you succeed.",
      icon: FaEnvelope,
      category: "Support"
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>JobPulse - Find Your Dream Job</title>
        <meta
          name="description"
          content="Discover thousands of job opportunities with top companies. Apply easily and grow your career with JobPulse."
        />
        <meta
          name="keywords"
          content="jobs, careers, employment, job search, hiring"
        />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black">
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
        </div>

        {/* Modern Animated Job Cards - Left Side */}
        <div className="absolute -left-24 bottom-32 hidden xl:block">
          <motion.div
            initial={{ opacity: 0, x: -100, rotate: -15, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: -15,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 1.2,
              delay: 1.5,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{
              rotate: -5,
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
            className="relative group"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>

            <div className="relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 p-8 w-80 shadow-2xl group-hover:shadow-orange-500/30 transition-all duration-500">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {heroJobCards[0].logo}
                  </motion.div>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <FaEye className="text-gray-300 w-4 h-4" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <FaHeart className="text-red-400 w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                <motion.h3
                  className="text-white font-bold text-xl mb-3 leading-tight"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {heroJobCards[0].title}
                </motion.h3>

                <p className="text-gray-300 text-base mb-4 font-medium">
                  {heroJobCards[0].company}
                </p>

                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <FaMapMarkerAlt className="mr-2 text-orange-400" />
                  {heroJobCards[0].location}
                </div>

                <div className="flex items-center justify-between">
                  <motion.span
                    className="text-orange-400 font-bold text-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {heroJobCards[0].salary} LPA
                  </motion.span>
                  <motion.span
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {heroJobCards[0].type}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modern Animated Job Cards - Right Side */}
        <div className="absolute -right-24 bottom-32 hidden xl:block">
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 15, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: 15,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 1.2,
              delay: 1.7,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              },
            }}
            whileHover={{
              rotate: 5,
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
            className="relative group"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>

            <div className="relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 p-8 w-80 shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-500">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {heroJobCards[1].logo}
                  </motion.div>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <FaEye className="text-gray-300 w-4 h-4" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <FaHeart className="text-red-400 w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                <motion.h3
                  className="text-white font-bold text-xl mb-3 leading-tight"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {heroJobCards[1].title}
                </motion.h3>

                <p className="text-gray-300 text-base mb-4 font-medium">
                  {heroJobCards[1].company}
                </p>

                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <FaMapMarkerAlt className="mr-2 text-blue-400" />
                  {heroJobCards[1].location}
                </div>

                <div className="flex items-center justify-between">
                  <motion.span
                    className="text-blue-400 font-bold text-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {heroJobCards[1].salary} LPA
                  </motion.span>
                  <motion.span
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {heroJobCards[1].type}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <motion.div
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8 group hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex -space-x-2">
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white overflow-hidden">
                    <Image
                      src="/images/user1.jpg"
                      alt="User 1"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white overflow-hidden">
                    <Image
                      src="/images/user2.jpg"
                      alt="User 2"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white overflow-hidden">
                    <Image
                      src="/images/user3.jpg"
                      alt="User 3"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <span className="text-white text-sm font-medium">
                  Trusted by 10,000+ professionals
                </span>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="block"
              >
                Where is your Next Job?
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                Just a Pulse Away!
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Discover thousands of job opportunities with top companies. Apply
              easily and grow your career with JobPulse.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 group-hover:shadow-orange-500/40"
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Browse Jobs
                  </motion.span>
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaArrowRight className="ml-3" />
                  </motion.div>
                </Link>
              </motion.div>
              {!user && (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl text-white text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-white/10"
                  >
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Get Started
                    </motion.span>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaPlay className="ml-3" />
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Company Logos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="absolute bottom-8 left-0 right-0 z-20"
        >
          <div className="container-custom">
            <div className="relative">
              {/* Fade effect overlays */}
              <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10"></div>
              <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10"></div>

              {/* Company logos */}
              <div className="flex items-center justify-center space-x-12 overflow-hidden">
                {companyLogos.map((company, index) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center shadow-lg">
                      <Image src={company.logo} alt={company.name} width={48} height={48} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

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
      </section>

      {/* Modern Features Section */}
      <section className="py-24 bg-black relative overflow-hidden">
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
            
            {/* Beam 5 - Cross Pattern */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-40 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent blur"
              animate={{
                opacity: [0.15, 0.6, 0.15],
                scaleY: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }}
              style={{
                transform: "translateX(-50%) translateY(-50%)"
              }}
            />
            
            {/* Beam 6 - Cross Pattern Horizontal */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-3 bg-gradient-to-r from-transparent via-red-500/60 to-transparent blur"
              animate={{
                opacity: [0.15, 0.6, 0.15],
                scaleX: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
              style={{
                transform: "translateX(-50%) translateY(-50%)"
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

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8"
            >
              <FaStar className="text-orange-400 text-sm" />
              <span className="text-white text-sm font-medium">
                Why Choose JobPulse?
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              <span className="text-white">for Your Success</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              We provide the tools and resources you need to succeed in your
              career journey.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => {
              // Calculate animation delay based on position
              let animationDelay = 0;
              if (index === 1) animationDelay = 0.2; // Center left
              else if (index === 2) animationDelay = 0.2; // Center right  
              else if (index === 0) animationDelay = 0.4; // Far left
              else if (index === 3) animationDelay = 0.4; // Far right

              return (
                <motion.div
                  key={feature.title}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.5,
                    y: 50,
                    filter: "blur(8px)"
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)"
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: animationDelay,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 80
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  className="relative group h-80"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {/* Hexagonal Container */}
                  <motion.div
                    className="relative bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl border-2 rounded-lg border-orange-500/30 p-8 shadow-2xl group-hover:shadow-3xl overflow-hidden h-full flex flex-col transform-gpu"
                    initial={{ 
                      clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
                      scale: 0.7,
                      rotate: 0
                    }}
                    whileInView={{ 
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      scale: 1,
                      rotate: 0
                    }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    transition={{ 
                      duration: 1.0, 
                      delay: animationDelay + 0.1,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    {/* Hexagonal Background Layers */}
                    <div className="absolute inset-0 overflow-hidden" style={{
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                    }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/12 via-red-500/10 to-orange-500/12"></div>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-red-400/10 to-orange-400/10"
                        animate={{
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5,
                        }}
                      />
                      {/* Beam-inspired Depth Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/8"></div>
                      {/* Geometric Pattern Overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(60deg, rgba(249, 115, 22, 0.2) 25%, transparent 25%, transparent 75%, rgba(249, 115, 22, 0.2) 75%)`,
                        backgroundSize: '30px 30px'
                      }}></div>
                      
                      {/* Glowing Background on Hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/15 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                        }}
                      />
                    </div>

                    {/* Beam Connection Lines */}
                    <motion.div
                      className="absolute top-1/2 -left-2 w-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: animationDelay + 0.3,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-l from-red-500 to-orange-500"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: animationDelay + 0.4,
                        ease: "easeOut"
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Hexagonal Icon - Fixed Animation */}
                      <motion.div
                        className="flex justify-center mb-6 flex-shrink-0"
                        initial={{ 
                          scale: 0,
                          opacity: 0
                        }}
                        whileInView={{ 
                          scale: 1,
                          opacity: 1
                        }}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        transition={{ 
                          duration: 0.7, 
                          delay: animationDelay + 0.2,
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 150
                        }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <motion.div 
                            className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl border border-orange-400/50 group-hover:shadow-orange-500/50 transition-all duration-300"
                            whileHover={{
                              boxShadow: "0 20px 40px rgba(249, 115, 22, 0.5)",
                              transition: { duration: 0.3 }
                            }}
                          >
                            <feature.icon className="text-2xl text-white drop-shadow-lg" />
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Hexagonal Title */}
                      <motion.h3
                        className="text-lg font-bold text-white mb-4 text-center leading-tight flex-shrink-0"
                        initial={{ 
                          opacity: 0,
                          y: 20,
                          scale: 0.9
                        }}
                        whileInView={{ 
                          opacity: 1,
                          y: 0,
                          scale: 1
                        }}
                        whileHover={{
                          scale: 1.05,
                          y: -2,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          duration: 0.6, 
                          delay: animationDelay + 0.4,
                          ease: "easeOut"
                        }}
                      >
                        {feature.title}
                      </motion.h3>

                      {/* Hexagonal Description */}
                      <motion.p 
                        className="text-gray-300 text-center leading-relaxed text-sm flex-grow"
                        initial={{ 
                          opacity: 0,
                          y: 15
                        }}
                        whileInView={{ 
                          opacity: 1,
                          y: 0
                        }}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          duration: 0.6, 
                          delay: animationDelay + 0.6,
                          ease: "easeOut"
                        }}
                      >
                        {feature.description}
                      </motion.p>
                      
                      {/* Hexagonal Accent Line */}
                      <motion.div
                        className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto flex-shrink-0"
                        initial={{ width: 0, opacity: 0, scaleX: 0 }}
                        whileInView={{ width: "3rem", opacity: 1, scaleX: 1 }}
                        whileHover={{
                          width: "4rem",
                          scaleX: 1.2,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          duration: 0.8, 
                          delay: animationDelay + 0.8,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Featured Jobs Section */}
      <section className="py-24 bg-black relative overflow-hidden">
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
            
            {/* Beam 5 - Cross Pattern */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-40 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent blur"
              animate={{
                opacity: [0.15, 0.6, 0.15],
                scaleY: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }}
              style={{
                transform: "translateX(-50%) translateY(-50%)"
              }}
            />
            
            {/* Beam 6 - Cross Pattern Horizontal */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-3 bg-gradient-to-r from-transparent via-red-500/60 to-transparent blur"
              animate={{
                opacity: [0.15, 0.6, 0.15],
                scaleX: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
              style={{
                transform: "translateX(-50%) translateY(-50%)"
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

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8"
            >
              <FaBriefcase className="text-orange-400 text-sm" />
              <span className="text-white text-sm font-medium">
                Latest Opportunities
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Featured Jobs
              </span>
              <br />
              <span className="text-white">from Top Companies</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Discover the latest opportunities from top companies and startups
              around the world.
            </motion.p>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
              >
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  View All Jobs
                </motion.span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaArrowRight className="ml-3" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 animate-pulse">
                    <div className="h-6 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <JobCard job={job} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section className="py-16 bg-black relative overflow-hidden">
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

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30"
              >
                <FaQuestionCircle className="text-orange-400 text-sm" />
                <span className="text-white text-sm font-medium">
                  Got Questions?
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />
                <span className="text-white">Questions</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-gray-300 leading-relaxed"
              >
                Find answers to the most common questions about JobPulse and how we can help you succeed in your career journey.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/faq"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
                  >
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      View All Questions
                    </motion.span>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaArrowRight className="ml-3" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - FAQ Items */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {faqs.slice(0, 4).map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="relative group"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <motion.div
                    className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500 overflow-hidden"
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
                          delay: index * 0.2,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                    </div>

                    <div className="relative z-10">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between group/button"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <faq.icon className="text-white text-sm" />
                          </motion.div>
                          <div>
                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors duration-300">
                              {faq.question}
                            </h3>
                            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-400 group-hover:text-orange-400 transition-colors duration-300"
                        >
                          {expandedFaq === index ? (
                            <FaChevronUp className="w-4 h-4" />
                          ) : (
                            <FaChevronDown className="w-4 h-4" />
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
                        <div className="px-6 pb-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mb-4"></div>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: expandedFaq === index ? 1 : 0,
                              y: expandedFaq === index ? 0 : 10,
                            }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-gray-300 leading-relaxed text-sm"
                          >
                            {faq.answer}
                          </motion.p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
