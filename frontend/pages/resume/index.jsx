import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaPlus, FaFileAlt, FaEdit, FaTrash, FaDownload, FaRocket, FaCode } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { toast } from 'react-hot-toast';
import FloatingLines from '../../components/FloatingLines';

export default function ResumeDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed automatic redirect on load to allow view of the page
    // Actions that require auth will redirect
    // useEffect(() => {
    //     if (!authLoading && !user) {
    //         router.push('/auth/login?redirect=/resume');
    //     }
    // }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchResumes();
        }
    }, [user]);

    const fetchResumes = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/resumes');
            if (data.success) {
                setResumes(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch resumes:', error);
            // Don't show error toast if it's just 401/403 (handled elsewhere or expected)
            // toast.error('Failed to load your resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResume = async () => {
        if (!user) {
            toast.error("Please login to create a resume");
            router.push('/auth/login?redirect=/resume');
            return;
        }

        try {
            // Create a default resume
            const { data } = await api.post('/resumes', {
                title: 'My New Resume',
                // contentJson will be populated by backend default
            });

            if (data.success) {
                toast.success('Resume created!');
                router.push(`/resume/editor/${data.data._id}`);
            }
        } catch (error) {
            console.error('Failed to create resume:', error);
            toast.error('Failed to create new resume');
        }
    };

    const handleDeleteResume = async (id, e) => {
        e.stopPropagation(); // Prevent navigation
        if (!window.confirm('Are you sure you want to delete this resume?')) return;

        try {
            await api.delete(`/resumes/${id}`);
            setResumes(resumes.filter(r => r._id !== id));
            toast.success('Resume deleted');
        } catch (error) {
            toast.error('Failed to delete resume');
        }
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }



    return (
        <>
            <Head>
                <title>Resume Studio - JobPulse</title>
            </Head>

            <div className="min-h-screen bg-black text-white">
                {/* Hero Section */}
                <div className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-black">
                    {/* Background Gradients & Floating Lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black to-black opacity-80 z-0" />

                    <div className="absolute inset-0 opacity-60 z-0">
                        <FloatingLines
                            linesGradient={["#e65100", "#c84613ff", "#9d3f1dff"]}
                            animationSpeed={0.005}
                            bendStrength={0.5}
                            bendRadius={300}
                        />
                    </div>

                    {/* Semicircular Lightning / Radial Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-transparent rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

                    <div className="container-custom relative z-10 pt-20">
                        <div className="flex flex-col items-center text-center max-w-7xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-full border border-orange-500/30 mb-8 group hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
                            >
                                <FaRocket className="text-orange-500 text-xs md:text-sm font-medium mr-2" />
                                <span>JobPulse Resume Studio</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                            >
                                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                    Build Your Future
                                </span>
                                <br />
                                <span className="text-4xl md:text-6xl bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                                    Line by Line
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                            >
                                The developer-friendly resume builder.  Write content in JSON, get a perfectly formatted PDF. ATS-ready, AI-optimized, and free to start.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <button
                                    onClick={handleCreateResume}
                                    className="btn-primary px-8 py-4 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all"
                                >
                                    <FaPlus className="mr-2" />
                                    Create Resume
                                </button>
                                <Link
                                    href="/resume/templates"
                                    className="px-8 py-4 text-lg font-semibold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center"
                                >
                                    View Templates
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Split Screen Graphic / "Video" rep - Ultra Wide */}
                    <div className="w-full max-w-[95%] md:max-w-[80%] mx-auto px-2 md:px-4 relative z-10 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="relative mx-auto w-full rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
                        >
                            {/* Window Header */}
                            <div className="h-10 bg-[#2d2d2d] border-b border-black flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                <div className="ml-4 text-xs text-gray-500 font-mono truncate">resume.json — JobPulse Studio</div>
                            </div>

                            {/* Split Content */}
                            <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
                                {/* Left: Fake Code */}
                                <div className="w-full md:w-1/2 p-4 md:p-6 font-mono text-xs md:text-base border-b md:border-b-0 md:border-r border-black font-medium relative bg-[#0a0a0a] min-h-[250px] md:min-h-0">
                                    <div className="text-blue-400">{"{"}</div>
                                    <div className="pl-4">
                                        <span className="text-green-400">"profile"</span>: <span className="text-yellow-400">{"{"}</span>
                                    </div>
                                    <div className="pl-8">
                                        <span className="text-green-400">"name"</span>: <span className="text-orange-400">"Monauwarul"</span>,
                                    </div>
                                    <div className="pl-8">
                                        <span className="text-green-400">"role"</span>: <span className="text-orange-400">"Frontend Engineer"</span>,
                                    </div>
                                    <div className="pl-8">
                                        <span className="text-green-400">"skills"</span>: [<span className="text-orange-400">"React"</span>, <span className="text-orange-400">"Three.js"</span>]
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-yellow-400">{"}"}</span>,
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-green-400">"experience"</span>: [...]
                                    </div>
                                    <div className="text-blue-400">{"}"}</div>

                                    {/* Cursor Animation */}
                                    <div className="absolute top-[138px] left-[180px] hidden md:block w-0.5 h-5 bg-orange-500 animate-pulse" />
                                </div>

                                {/* Right: Fake Preview */}
                                <div className="w-full md:w-1/2 bg-gray-100 p-4 md:p-10 relative overflow-hidden h-[300px] md:h-auto">
                                    <div className="w-full h-full bg-white shadow-lg p-4 md:p-8 transform scale-100 origin-top">
                                        <div className="h-4 md:h-6 w-32 bg-gray-800 mb-1" /> {/* Name */}
                                        <div className="h-2 md:h-3 w-24 bg-orange-500/50 mb-4" /> {/* Role */}

                                        <div className="h-px w-full bg-gray-300 mb-4" />

                                        <div className="space-y-2 mb-4">
                                            <div className="h-2 w-full bg-gray-200" />
                                            <div className="h-2 w-5/6 bg-gray-200" />
                                            <div className="h-2 w-4/6 bg-gray-200" />
                                        </div>

                                        <div className="flex gap-2 mb-4">
                                            <div className="h-4 w-12 bg-gray-200 rounded" />
                                            <div className="h-4 w-14 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-24 relative overflow-hidden">
                    {/* Background glow for features */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="container-custom relative z-10">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <FaRocket />,
                                    title: "ATS-Optimized",
                                    desc: "Clean, structured data that passes Applicant Tracking Systems (ATS) every time. No broken layouts.",
                                    color: "from-orange-500 to-red-500"
                                },
                                {
                                    icon: <FaCode />,
                                    title: "Developer Friendly",
                                    desc: "Edit your resume like you edit code. JSON-based DSL gives you improved control without the drag-and-drop headache.",
                                    color: "from-red-500 to-orange-600"
                                },
                                {
                                    icon: <FaRocket />, // Or maybe FaMagic for AI?
                                    title: "AI-Powered",
                                    desc: "Instant suggestions to tailor your resume for specific job descriptions. Stand out from the stack.",
                                    color: "from-orange-400 to-yellow-500"
                                }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300 group"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resumes List */}
                <div className="container-custom py-16">
                    <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">Your Resumes</h2>
                            <p className="text-gray-500">Manage and edit your career documents</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-500">{resumes.length}</div>
                            <div className="text-xs uppercase tracking-widest text-gray-500">Documents</div>
                        </div>
                    </div>

                    {resumes.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-500/30">
                                    <FaFileAlt className="text-3xl text-gray-600 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No resumes yet</h3>
                                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                                    Create your first professional resume today. It only takes a few minutes to get started.
                                </p>
                                <button
                                    onClick={handleCreateResume}
                                    className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 group-hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-shadow duration-300"
                                >
                                    <FaPlus />
                                    <span>Create New Resume</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {resumes.map((resume) => (
                                <motion.div
                                    key={resume._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer flex flex-col h-full"
                                    onClick={() => router.push(`/resume/editor/${resume._id}`)}
                                >
                                    {/* Preview Area */}
                                    <div className="h-56 bg-[#0f0f0f] relative overflow-hidden border-b border-white/5 group-hover:border-orange-500/10 transition-colors">
                                        {/* Mock Paper */}
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-64 bg-white shadow-2xl rounded-sm transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 opacity-90">
                                            <div className="p-4 space-y-2 opacity-50">
                                                <div className="h-2 w-16 bg-gray-800 rounded-sm mb-4" />
                                                <div className="h-1 w-full bg-gray-300 rounded-sm" />
                                                <div className="h-1 w-full bg-gray-300 rounded-sm" />
                                                <div className="h-1 w-2/3 bg-gray-300 rounded-sm" />
                                                <div className="mt-4 flex gap-2">
                                                    <div className="h-12 w-1 bg-gray-200" />
                                                    <div className="space-y-1 flex-1">
                                                        <div className="h-1 w-full bg-gray-200" />
                                                        <div className="h-1 w-full bg-gray-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex gap-3">
                                                <span className="p-3.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-xl">
                                                    <FaEdit />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-5 flex-1 flex flex-col justify-between bg-white/[0.02]">
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-orange-400 transition-colors truncate">{resume.title}</h3>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-white/10 text-gray-400 border border-white/5">
                                                    {resume.templateId || 'Modern'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5 mt-2">
                                            <span className="flex items-center gap-1">
                                                Edited {new Date(resume.updatedAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteResume(resume._id, e)}
                                                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-white/5 transition-all"
                                                title="Delete Resume"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </>
    );
}
