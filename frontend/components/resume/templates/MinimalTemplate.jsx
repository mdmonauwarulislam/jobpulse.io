import React from 'react';

export const MinimalTemplate = ({ data, settings = {} }) => {
    if (!data || !data.profile) return <div className="text-gray-400 p-8 text-center">Invalid Resume Data</div>;

    const { profile, summary, experience, education, skills, projects } = data;

    // improved default settings
    const {
        margin = 20, // larger default margin for minimal
        fontSize = 10,
        lineHeight = 1.6,
        primaryColor = '#111827', // dark gray/black default
        sectionSpacing = 30,
        itemSpacing = 15
    } = settings;

    const containerStyle = {
        padding: `${margin}mm`,
        fontSize: `${fontSize}pt`,
        lineHeight: lineHeight,
        fontFamily: "'Inter', sans-serif"
    };

    const sectionTitleStyle = {
        color: '#9ca3af', // gray-400
        marginBottom: `${sectionSpacing * 0.8}px`,
        fontSize: `${fontSize - 1}pt`
    };

    const headingTitleStyle = {
        color: primaryColor,
        fontSize: `${fontSize + 12}pt`
    };

    return (
        <div style={containerStyle} className="bg-white text-black min-h-[297mm] w-[210mm] shadow-2xl font-sans" id="resume-preview">
            {/* Centered Header */}
            <header className="text-center" style={{ marginBottom: `${sectionSpacing + 10}px` }}>
                <h1 style={headingTitleStyle} className="font-light uppercase tracking-[0.2em] mb-4">{profile.name}</h1>
                <div className="text-sm text-gray-500 uppercase tracking-widest mb-6" style={{ fontSize: `${fontSize}pt` }}>{profile.title}</div>

                <div className="flex justify-center flex-wrap gap-4 text-gray-500 font-medium" style={{ fontSize: `${fontSize - 2}pt` }}>
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>• {profile.phone}</span>}
                    {profile.location && <span>• {profile.location}</span>}
                    {profile.links && profile.links.map((link, i) => (
                        <React.Fragment key={i}>
                            <span>•</span>
                            <a href={link.url} className="text-gray-700 hover:text-black">{link.label}</a>
                        </React.Fragment>
                    ))}
                </div>
            </header>

            {/* Summary - Clean minimal block */}
            {summary && (
                <section className="max-w-2xl mx-auto text-center" style={{ marginBottom: `${sectionSpacing}px` }}>
                    <p className="leading-7 text-gray-600 italic">{summary}</p>
                </section>
            )}

            <div className="border-t border-gray-200 w-16 mx-auto" style={{ marginBottom: `${sectionSpacing}px` }}></div>

            {/* Main Content */}
            <div style={{ gap: `${sectionSpacing}px` }} className="flex flex-col">

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section>
                        <h3 style={sectionTitleStyle} className="font-bold uppercase tracking-widest text-center">Experience</h3>
                        <div style={{ gap: `${itemSpacing * 1.5}px` }} className="flex flex-col">
                            {experience.map((exp, i) => (
                                <div key={i} className="grid grid-cols-[1fr_3fr] gap-6">
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-800">{exp.company}</div>
                                        <div className="text-xs text-gray-500 mt-1">{exp.start} — {exp.end}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2">{exp.role}</div>
                                        <ul className="text-gray-600 space-y-2 leading-relaxed">
                                            {exp.points && exp.points.map((pt, j) => (
                                                <li key={j}>{pt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education & Projects Split */}
                <div className="grid grid-cols-2 gap-12 pt-4">
                    {education && education.length > 0 && (
                        <section>
                            <h3 style={sectionTitleStyle} className="font-bold uppercase tracking-widest text-center">Education</h3>
                            <div style={{ gap: `${itemSpacing}px` }} className="flex flex-col">
                                {education.map((edu, i) => (
                                    <div key={i} className="text-center">
                                        <div className="font-semibold text-gray-900">{edu.college}</div>
                                        <div className="text-xs text-gray-600 mt-1">{edu.degree}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {skills && (
                        <section>
                            <h3 style={sectionTitleStyle} className="font-bold uppercase tracking-widest text-center">Skills</h3>
                            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
                                {Object.entries(skills).map(([category, items], i) => (
                                    <div key={i}>
                                        <div className="text-xs font-medium text-gray-500 mb-1 capitalize">{category}</div>
                                        <div className="text-gray-800 leading-relaxed">
                                            {items.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
};
