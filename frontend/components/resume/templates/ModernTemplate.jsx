import React from 'react';

export const ModernTemplate = ({ data, settings = {} }) => {
    if (!data || !data.profile) return <div className="text-gray-400 p-8 text-center">Invalid Resume Data</div>;

    const { profile, summary, experience, education, skills, projects } = data;

    // improved default settings
    const {
        margin = 15, // reduced default detailed margin
        fontSize = 10, // standard readable font size for resume
        lineHeight = 1.4,
        primaryColor = '#000000',
        sectionSpacing = 20, // spacing between main sections
        itemSpacing = 10     // spacing between items within a section
    } = settings;

    const containerStyle = {
        padding: `${margin}mm`,
        fontSize: `${fontSize}pt`,
        lineHeight: lineHeight,
        fontFamily: "'Inter', sans-serif" // Ensure a clean font is used
    };

    const sectionStyle = {
        marginBottom: `${sectionSpacing}px`
    };

    const headingStyle = {
        fontSize: `${fontSize + 8}pt`,
        color: primaryColor,
        borderColor: primaryColor
    };

    const subHeadingStyle = {
        fontSize: `${fontSize + 2}pt`,
        color: primaryColor
    };

    return (
        <div style={containerStyle} className="bg-white text-black min-h-[297mm] w-[210mm] shadow-2xl" id="resume-preview">
            {/* Header */}
            <header style={{ ...sectionStyle, borderBottomColor: primaryColor }} className="border-b-2 pb-4">
                <h1 style={headingStyle} className="font-bold uppercase tracking-wider mb-2">{profile.name}</h1>
                <h2 style={{ fontSize: `${fontSize + 4}pt` }} className="text-gray-600 mb-4">{profile.title}</h2>

                <div className="flex flex-wrap gap-4 text-gray-600">
                    {profile.email && <span>📧 {profile.email}</span>}
                    {profile.phone && <span>📱 {profile.phone}</span>}
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.links && profile.links.map((link, i) => (
                        <a key={i} href={link.url} style={{ color: primaryColor }} className="hover:underline">🔗 {link.label}</a>
                    ))}
                </div>
            </header>

            {/* Summary */}
            {summary && (
                <section style={sectionStyle}>
                    <h3 style={{ ...subHeadingStyle, borderBottomColor: '#d1d5db' }} className="font-bold uppercase border-b mb-3">Professional Summary</h3>
                    <p className="leading-relaxed text-gray-700">{summary}</p>
                </section>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <section style={sectionStyle}>
                    <h3 style={{ ...subHeadingStyle, borderBottomColor: '#d1d5db' }} className="font-bold uppercase border-b mb-3">Experience</h3>
                    <div style={{ gap: `${itemSpacing}px` }} className="flex flex-col">
                        {experience.map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 style={{ fontSize: `${fontSize + 1}pt` }} className="font-bold text-gray-800">{exp.role}</h4>
                                    <span className="text-gray-500 whitespace-nowrap ml-4">{exp.start} - {exp.end}</span>
                                </div>
                                <div className="font-semibold text-gray-600 mb-2">{exp.company}</div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {exp.points && exp.points.map((pt, j) => (
                                        <li key={j}>{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <section style={sectionStyle}>
                    <h3 style={{ ...subHeadingStyle, borderBottomColor: '#d1d5db' }} className="font-bold uppercase border-b mb-3">Projects</h3>
                    <div style={{ gap: `${itemSpacing}px` }} className="flex flex-col">
                        {projects.map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 style={{ fontSize: `${fontSize + 1}pt` }} className="font-bold text-gray-800">{proj.name}</h4>
                                    {proj.link && <a href={proj.link} style={{ color: primaryColor }} className="text-xs hover:underline">View Project</a>}
                                </div>
                                <p className="text-gray-700 mb-1">{proj.description}</p>
                                <div className="flex gap-2">
                                    {proj.tech && proj.tech.map((t, j) => (
                                        <span key={j} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-2 gap-8">
                {/* Education */}
                {education && education.length > 0 && (
                    <section style={sectionStyle}>
                        <h3 style={{ ...subHeadingStyle, borderBottomColor: '#d1d5db' }} className="font-bold uppercase border-b mb-3">Education</h3>
                        <div style={{ gap: `${itemSpacing}px` }} className="flex flex-col">
                            {education.map((edu, i) => (
                                <div key={i}>
                                    <h4 className="font-bold text-gray-800">{edu.college}</h4>
                                    <div className="text-gray-600">{edu.degree}</div>
                                    <div className="text-sm text-gray-500">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills && (
                    <section style={sectionStyle}>
                        <h3 style={{ ...subHeadingStyle, borderBottomColor: '#d1d5db' }} className="font-bold uppercase border-b mb-3">Skills</h3>
                        <div style={{ gap: `${itemSpacing * 0.8}px` }} className="flex flex-col">
                            {Object.entries(skills).map(([category, items], i) => (
                                <div key={i}>
                                    <h4 className="font-semibold text-gray-700 uppercase mb-1" style={{ fontSize: `${fontSize - 1}pt` }}>{category}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {items.map((skill, j) => (
                                            <span key={j} className="bg-gray-200 px-2 py-1 rounded text-gray-700" style={{ fontSize: `${fontSize - 1}pt` }}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
