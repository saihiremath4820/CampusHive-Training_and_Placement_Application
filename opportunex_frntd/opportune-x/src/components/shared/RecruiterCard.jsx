import React, { useState } from 'react';
import './RecruiterCard.css';

const heroColors = [
    '#fef4e2', // warm yellow
    '#e8f4fd', // soft blue
    '#f0fdf4', // soft green
    '#fdf2f8', // soft pink
    '#f5f3ff', // soft purple
    '#fff7ed', // soft orange
];

const RecruiterCard = ({ company, index = 0 }) => {
    const bgColor = heroColors[index % heroColors.length];
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveToggle = () => {
        // In a real application, you'd call an API here to persist the saved state
        // For example: await toggleSaveRecruiter(company._id);
        setIsSaved(!isSaved);
    };

    return (
        <article className="recruiter-card">
            <section className="card__hero" style={{ backgroundColor: bgColor }}>
                <header className="card__hero-header">
                    <span>{company.package ? (company.package.toLowerCase().includes('lpa') ? company.package : `₹${company.package} LPA`) : "TBD"}</span>
                    <button
                        className="card__icon"
                        onClick={handleSaveToggle}
                        aria-label={isSaved ? "Remove from saved" : "Save recruiter"}
                        title={isSaved ? "Remove from saved" : "Save recruiter"}
                    >
                        <svg height="20" width="20" stroke="currentColor" strokeWidth="1.5"
                            viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"}
                            style={{ color: isSaved ? '#2563eb' : 'currentColor', transition: 'color 0.2s, fill 0.2s' }}>
                            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                                strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                    </button>
                </header>
                <p className="card__job-title">{company.role || "Role Not Specified"}</p>
            </section>
            <footer className="card__footer">
                <div className="card__job-summary">
                    <div className="card__job-icon">
                        <div className="card__company-avatar">
                            {(company.companyName || "?").charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="card__job">
                        <p className="card__company-name">{company.companyName}</p>
                        <p className="card__industry">{company.industry || "Technology / IT"}</p>
                    </div>
                </div>
            </footer>
        </article>
    );
};

export default RecruiterCard;
