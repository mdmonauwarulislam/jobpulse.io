import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaCode, FaEye, FaLock, FaRocket } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Mock Templates Data
const TEMPLATES = [
    {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Clean, minimalist design perfect for tech and creative roles.',
        imageColor: 'from-blue-500/20 to-cyan-500/20',
        tags: ['Tech', 'Startups', 'Design']
    },
    {
        id: 'executive',
        name: 'Executive Suite',
        description: 'Traditional layout with a sophisticated touch for management.',
        imageColor: 'from-slate-500/20 to-gray-500/20',
        tags: ['Management', 'Finance', 'Corporate']
    },
    {
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Stand out with unique formatting and bold headers.',
        imageColor: 'from-purple-500/20 to-pink-500/20',
        tags: ['Art', 'Media', 'Freelance']
    },
    {
        id: 'minimal',
        name: 'Strictly Minimal',
        description: 'No fluff. Just your experience and skills.',
        imageColor: 'from-green-500/20 to-emerald-500/20',
        tags: ['Engineering', 'Academic']
    }
];

export default function TemplatesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUseTemplate = async (templateId) => {
        if (!user) {
            toast.error('Please login to use this template');
            router.push(`/auth/login?redirect=/resume/templates`);
            return;
        }

        setLoading(true);
        try {
            // Create a new resume with this template
            const { data } = await api.post('/resumes', {
                title: `My ${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Resume`,
                templateId: templateId
                // In a real app, we might seed 'contentJson' differently based on template
            });

            if (data.success) {
                toast.success('Resume created!');
                router.push(`/resume/editor/${data.data._id}`);
            }
        } catch (error) {
            console.error('Failed to create resume:', error);
            toast.error('Failed to create resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Resume Templates - JobPulse</title>
            </Head>

            <div className="min-h-screen bg-black text-white pt-24 pb-12">
                <div className="container-custom">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
                        >
                            Choose Your Template
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400"
                        >
                            Start with a professionally designed structure. Fully customizable with our Code Editor.
                        </motion.p>
                    </div>

                    {/* Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TEMPLATES.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300"
                            >
                                {/* Mock Preview Area */}
                                <div className={`h-64 bg-gradient-to-br ${template.imageColor} relative overflow-hidden group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}>

                                    {/* Abstract Resume Representation */}
                                    <div className="w-40 h-52 bg-white shadow-2xl rounded-sm p-4 opacity-90 transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300 flex flex-col gap-2">
                                        <div className="h-4 w-20 bg-gray-800 rounded-sm mb-2" />
                                        <div className="h-2 w-32 bg-gray-200 rounded-sm" />
                                        <div className="h-2 w-24 bg-gray-200 rounded-sm mb-2" />

                                        <div className="flex gap-2">
                                            <div className="w-1/3 flex flex-col gap-1">
                                                <div className="h-20 bg-gray-100 rounded-sm" />
                                            </div>
                                            <div className="w-2/3 flex flex-col gap-1">
                                                <div className="h-2 bg-gray-200 rounded-sm" />
                                                <div className="h-2 bg-gray-200 rounded-sm" />
                                                <div className="h-2 bg-gray-200 rounded-sm" />
                                                <div className="h-2 bg-gray-200 rounded-sm mt-2" />
                                                <div className="h-2 bg-gray-200 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => handleUseTemplate(template.id)}
                                            className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            <FaRocket className="mr-2" />
                                            Use Template
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                                        {!user && <FaLock className="text-gray-500 text-sm" title="Login required" />}
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 h-10">{template.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {template.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
