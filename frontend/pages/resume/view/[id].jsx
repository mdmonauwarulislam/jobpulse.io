import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaDownload, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import { api } from '../../../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PublicResumeView() {
    const router = useRouter();
    const { id } = router.query;
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const resumeRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchResume();
        }
    }, [id]);

    const fetchResume = async () => {
        try {
            // Assuming api.get handles optional auth correctly
            const { data } = await api.get(`/resumes/${id}`);
            if (data.success) {
                setResume(data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError('Resume not found or private');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = resumeRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;

            pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${resume.contentJson?.profile?.name || 'Resume'}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="text-6xl text-gray-300 mb-4"><FaFileAlt /></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || "Resume Not Found"}</h1>
                <p className="text-gray-600 mb-6">This resume may be private or deleted.</p>
                <button onClick={() => router.push('/')} className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">Go Home</button>
            </div>
        );
    }

    const data = resume.contentJson || {};
    const { profile, summary, experience, education, skills, projects } = data;

    return (
        <>
            <Head>
                <title>{profile?.name ? `${profile.name} - Resume` : 'Resume View'} | JobPulse</title>
            </Head>

            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                {/* Actions Bar */}
                <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">
                        Viewing publicly shared resume
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium text-sm"
                    >
                        <FaDownload />
                        <span>Download PDF</span>
                    </button>
                </div>

                {/* Resume Render */}
                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm]" ref={resumeRef}>
                    <div className="p-12 md:p-16">
                        {/* Header */}
                        <header className="border-b-2 border-gray-800 pb-6 mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-3 text-gray-900">{profile?.name}</h1>
                            <h2 className="text-xl md:text-2xl text-gray-600 font-light mb-6">{profile?.title}</h2>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                {profile?.email && <div className="flex items-center"><FaEnvelope className="mr-2" /> {profile.email}</div>}
                                {profile?.phone && <div className="flex items-center"><FaPhone className="mr-2" /> {profile.phone}</div>}
                                {profile?.location && <div className="flex items-center"><FaMapMarkerAlt className="mr-2" /> {profile.location}</div>}
                                {profile?.links && profile.links.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                                        {link.label.toLowerCase().includes('linkedin') ? <FaLinkedin className="mr-2" /> :
                                            link.label.toLowerCase().includes('github') ? <FaGithub className="mr-2" /> : '🔗 '}
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </header>

                        {/* Summary */}
                        {summary && (
                            <section className="mb-8">
                                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-gray-800">Professional Summary</h3>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{summary}</p>
                            </section>
                        )}

                        {/* Experience */}
                        {experience && experience.length > 0 && (
                            <section className="mb-8">
                                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-gray-800">Experience</h3>
                                <div className="space-y-6">
                                    {experience.map((exp, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-gray-800 text-lg">{exp.role}</h4>
                                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">{exp.start} - {exp.end}</span>
                                            </div>
                                            <div className="text-base font-semibold text-gray-600 mb-2">{exp.company}</div>
                                            <ul className="list-disc list-outside ml-4 text-sm md:text-base text-gray-700 space-y-1.5 marker:text-gray-400">
                                                {exp.points && exp.points.map((pt, j) => (
                                                    <li key={j} className="pl-1">{pt}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {projects && projects.length > 0 && (
                            <section className="mb-8">
                                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-gray-800">Projects</h3>
                                <div className="space-y-5">
                                    {projects.map((proj, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-gray-800">{proj.name}</h4>
                                                {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Project ↗</a>}
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{proj.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {proj.tech && proj.tech.map((t, j) => (
                                                    <span key={j} className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-600">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Education */}
                            {education && education.length > 0 && (
                                <section className="mb-8">
                                    <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-gray-800">Education</h3>
                                    <div className="space-y-4">
                                        {education.map((edu, i) => (
                                            <div key={i}>
                                                <h4 className="font-bold text-gray-800">{edu.college}</h4>
                                                <div className="text-sm text-gray-700">{edu.degree}</div>
                                                <div className="text-sm text-gray-500 mt-1">{edu.year}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Skills */}
                            {skills && (
                                <section className="mb-8">
                                    <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-gray-800">Skills</h3>
                                    <div className="space-y-4">
                                        {Object.entries(skills).map(([category, items], i) => (
                                            <div key={i}>
                                                <h4 className="font-semibold text-gray-700 text-sm uppercase mb-2">{category}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {items.map((skill, j) => (
                                                        <span key={j} className="text-sm bg-gray-100 border border-gray-200 px-3 py-1 rounded text-gray-700">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
