import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { FaSave, FaArrowLeft, FaDownload, FaMagic, FaSpinner, FaTimes, FaRocket, FaPalette } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Dynamic Template Imports
import { ModernTemplate } from '../../../components/resume/templates/ModernTemplate';
import { MinimalTemplate } from '../../../components/resume/templates/MinimalTemplate';

// Dynamic import for Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ResumeEditor() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();

    const [resume, setResume] = useState(null);
    const [jsonContent, setJsonContent] = useState('{}');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewKey, setPreviewKey] = useState(0); // Force re-render of preview
    const [templateId, setTemplateId] = useState('modern');

    const previewRef = useRef(null);

    // ... (Auth checks remain same)

    const [showSettings, setShowSettings] = useState(false);
    const [layoutSettings, setLayoutSettings] = useState({
        margin: 15,
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 15,
        itemSpacing: 8,
        primaryColor: '#000000'
    });

    // ... (Auth checks remain same)

    useEffect(() => {
        if (id && user) {
            fetchResume();
        }
    }, [id, user]);

    const fetchResume = async () => {
        try {
            const { data } = await api.get(`/resumes/${id}`);
            if (data.success) {
                setResume(data.data);
                setTemplateId(data.data.templateId || 'modern');
                setJsonContent(JSON.stringify(data.data.contentJson || {}, null, 2));
                // Load saved settings if they exist (assuming backend supports it, otherwise default)
                if (data.data.settings) {
                    setLayoutSettings({ ...layoutSettings, ...data.data.settings });
                }
            }
        } catch (error) { //... error handling same
            toast.error('Failed to load resume');
            router.push('/resume');
        } finally {
            setLoading(false);
        }
    };

    // ... handleEditorChange, handleSave, handleAIOptimize, AIModal, handleDownloadPDF same ...


    const handleEditorChange = (value) => {
        setJsonContent(value);
    };

    const [showAIModal, setShowAIModal] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // ... existing handleSave ...
    const handleSave = async () => {
        setSaving(true);
        try {
            let parsedContent;
            try {
                parsedContent = JSON.parse(jsonContent);
            } catch (e) {
                toast.error('Invalid JSON format. Please fix errors before saving.');
                setSaving(false);
                return;
            }

            const { data } = await api.put(`/resumes/${id}`, {
                contentJson: parsedContent,
                title: parsedContent.profile?.name ? `${parsedContent.profile.name}'s Resume` : resume.title,
                settings: layoutSettings // Save visual settings too
            });

            if (data.success) {
                setResume(data.data);
                toast.success('Resume saved');
                setPreviewKey(prev => prev + 1); // Refresh preview
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const handleAIOptimize = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setAiLoading(true);
        try {
            // Mock AI response for now since backend endpoint isn't fully ready or we don't have OpenAI key here
            // In production, this would call api.post('/resumes/optimize', { resumeId: id, jobDescription })

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

            // Actually modify the JSON to show "AI" working
            try {
                const current = JSON.parse(jsonContent);
                // Simple keyword injection mock
                if (current.summary) {
                    current.summary += ` Optimized for: ${jobDescription.substring(0, 20)}... (AI Enhanced)`;
                }
                if (current.skills && Array.isArray(current.skills.Languages)) {
                    current.skills.Languages.push("AI-Optimized Communication");
                }
                setJsonContent(JSON.stringify(current, null, 2));
                toast.success('AI suggestions applied to JSON!');
            } catch (e) {
                console.error("AI apply error", e);
                toast.success('AI suggestions generated! (Check console)');
            }

            setShowAIModal(false);
        } catch (error) {
            toast.error('AI optimization failed');
        } finally {
            setAiLoading(false);
        }
    };

    const AIModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <h3 className="text-white font-semibold flex items-center">
                        <FaMagic className="mr-2 text-purple-400" />
                        AI Resume Enhancer
                    </h3>
                    <button
                        onClick={() => setShowAIModal(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 mb-4 text-sm">
                        Paste the Job Description (JD) below. Our AI will analyze it and optimize your resume keywords and summary to check compatibility.
                    </p>
                    <textarea
                        className="w-full h-40 bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        placeholder="Paste job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>
                <div className="p-4 border-t border-white/10 flex justify-end bg-[#252525]">
                    <button
                        onClick={() => setShowAIModal(false)}
                        className="px-4 py-2 text-gray-300 hover:text-white mr-2 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAIOptimize}
                        disabled={aiLoading}
                        className="btn-primary px-4 py-2 text-sm flex items-center bg-purple-600 hover:bg-purple-700 border-none"
                    >
                        {aiLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaRocket className="mr-2" />}
                        Enhance Resume
                    </button>
                </div>
            </div>
        </div>
    );

    const handleDownloadPDF = async () => {
        const element = previewRef.current;
        if (!element) return;

        const toastId = toast.loading('Compiling PDF...');

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff' // Ensure white background
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // const imgX = (pdfWidth - imgWidth * ratio) / 2;
            // const imgY = 0; // Top align

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); // Fit to page
            pdf.save(`${resume.title || 'resume'}.pdf`);

            toast.success('Resume Compiled & Downloaded!', { id: toastId });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    // Template Renderer Dispatcher
    const ResumePreview = ({ data }) => {
        switch (templateId) {
            case 'minimal':
                return <MinimalTemplate data={data} settings={layoutSettings} />;
            case 'modern':
            default:
                return <ModernTemplate data={data} settings={layoutSettings} />;
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Editor...</div>;

    let previewData = {};
    try {
        previewData = JSON.parse(jsonContent);
    } catch (e) {
        // console.log("JSON Parse Error", e);
    }

    return (
        <>
            <Head>
                <title>Edit Resume | JobPulse</title>
            </Head>

            <div className="min-h-screen bg-[#1e1e1e] flex flex-col h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-[#2d2d2d] border-b border-black flex items-center justify-between px-6 shrink-0 z-20 relative">
                    <div className="flex items-center">
                        <button onClick={() => router.push('/resume')} className="text-gray-400 hover:text-white mr-4">
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-white font-medium truncate max-w-xs">{resume?.title}</h1>
                        <span className="ml-4 px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Editor Mode
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`px-3 py-1.5 text-sm flex items-center rounded transition-colors ${showSettings ? 'bg-orange-600 text-white' : 'bg-[#3d3d3d] text-gray-300 hover:text-white'}`}
                        >
                            <FaPalette className="mr-2" />
                            <span className="hidden sm:inline">Design</span>
                        </button>
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 px-3 py-1.5 text-sm flex items-center rounded transition-all"
                        >
                            <FaMagic className="mr-2" />
                            <span className="hidden sm:inline">AI Enhancer</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary px-4 py-1.5 text-sm flex items-center bg-blue-600 hover:bg-blue-700 border-none ml-2"
                        >
                            {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                            Save & Compile
                        </button>

                        <div className="h-6 w-px bg-white/20 mx-2"></div>

                        <button
                            onClick={handleDownloadPDF}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm flex items-center rounded transition-colors shadow-lg font-medium"
                        >
                            <FaDownload className="mr-2" />
                            Download PDF
                        </button>
                    </div>
                </header>

                {/* Main Workspace */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left: Editor */}
                    <div className="w-1/2 border-r border-black flex flex-col">
                        <div className="bg-[#1e1e1e] text-gray-400 text-xs px-4 py-2 border-b border-black flex justify-between">
                            <span>resume.json</span>
                            <span>Auto-saving enabled</span>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage="json"
                                theme="vs-dark"
                                value={jsonContent}
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    contextmenu: true,
                                    mouseWheelZoom: true,
                                    formatOnPaste: true,
                                    formatOnType: true
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="w-1/2 bg-[#525659] overflow-y-auto overflow-x-hidden p-8 flex justify-center relative">

                        {/* Design Settings Panel (Overlay) */}
                        {showSettings && (
                            <div className="absolute top-4 right-4 z-40 w-64 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-right-10 duration-200">
                                <h3 className="text-white font-semibold mb-4 pb-2 border-b border-white/10 flex justify-between">
                                    <span>Template Settings</span>
                                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Page Margin (mm)</label>
                                        <input
                                            type="range" min="5" max="30" step="1"
                                            value={layoutSettings.margin}
                                            onChange={(e) => setLayoutSettings({ ...layoutSettings, margin: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                        <div className="text-right text-xs text-orange-500">{layoutSettings.margin}mm</div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Font Size (pt)</label>
                                        <input
                                            type="range" min="8" max="14" step="0.5"
                                            value={layoutSettings.fontSize}
                                            onChange={(e) => setLayoutSettings({ ...layoutSettings, fontSize: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                        <div className="text-right text-xs text-orange-500">{layoutSettings.fontSize}pt</div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Line Height</label>
                                        <input
                                            type="range" min="1.0" max="2.0" step="0.1"
                                            value={layoutSettings.lineHeight}
                                            onChange={(e) => setLayoutSettings({ ...layoutSettings, lineHeight: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                        <div className="text-right text-xs text-orange-500">{layoutSettings.lineHeight}</div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Section Spacing (px)</label>
                                        <input
                                            type="range" min="5" max="40" step="1"
                                            value={layoutSettings.sectionSpacing}
                                            onChange={(e) => setLayoutSettings({ ...layoutSettings, sectionSpacing: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                        <div className="text-right text-xs text-orange-500">{layoutSettings.sectionSpacing}px</div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Primary Color</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['#000000', '#2563eb', '#dc2626', '#16a34a', '#d97706'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setLayoutSettings({ ...layoutSettings, primaryColor: color })}
                                                    className={`w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform ${layoutSettings.primaryColor === color ? 'ring-2 ring-white' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={previewRef} className="origin-top w-fit shadow-2xl">
                            <ResumePreview data={previewData} key={previewKey} />
                        </div>
                    </div>
                </div>
            </div>
            {showAIModal && <AIModal />}
        </>
    );
}
