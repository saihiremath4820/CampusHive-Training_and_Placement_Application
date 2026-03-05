import React from 'react';
import { Clock, User } from 'lucide-react';
import './TrainingCard.css';

const TrainingCard = ({ training, index }) => {
    const tagColors = [
        { bg: '#ede9fe', text: '#7c3aed', border: '#7c3aed' }, // purple
        { bg: '#dcfce7', text: '#16a34a', border: '#16a34a' }, // green
        { bg: '#fef9c3', text: '#ca8a04', border: '#ca8a04' }, // yellow
        { bg: '#dbeafe', text: '#2563eb', border: '#2563eb' }, // blue
    ];

    const typeColors = {
        'Workshop': '#7c3aed',
        'Career Guidance': '#16a34a',
        'Awareness Session': '#ca8a04',
        'Seminar': '#2563eb',
        'Bootcamp': '#dc2626',
        'default': '#2563eb'
    };

    const color = tagColors[index % tagColors.length];
    const topBorderColor = typeColors[training.category || training.type] || typeColors.default;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Speakers/Organizers mapping (using resourcePerson from data)
    const speakers = training.resourcePerson || training.trainer || training.speakers;

    // Attendee count mapping (using actual data field if exists, or 0)
    const attendeeCount = training.attendees || training.registeredCount || 0;

    return (
        <div className="ch-training-card" style={{ borderTop: `3px solid ${topBorderColor}` }}>
            {/* Top row — tag and date */}
            <div className="ch-training-card__header">
                <div className="ch-training-card__tag-wrap">
                    <span className="ch-training-card__icon"
                        style={{ backgroundColor: color.bg, color: color.text }}>
                        📖
                    </span>
                    <span className="ch-training-card__tag"
                        style={{ color: color.text }}>
                        {training.category || training.type || 'Activity'}
                    </span>
                </div>
                <span className="ch-training-card__date">
                    {formatDate(training.date)}
                </span>
            </div>

            {/* Title */}
            <h3 className="ch-training-card__title">{training.title || training.name}</h3>

            {/* Speakers */}
            {speakers && (
                <div className="ch-training-card__speakers">
                    <span className="ch-training-card__speaker-icon">👤</span>
                    <span className="ch-training-card__speaker-text">
                        {speakers}
                    </span>
                </div>
            )}

            {/* Bottom stats row */}
            <div className="ch-training-card__stats">
                {training.date && (
                    <div className="ch-training-card__stat">
                        <Clock size={14} />
                        <span>{formatDate(training.date)}</span>
                    </div>
                )}
                {attendeeCount > 0 && (
                    <div className="ch-training-card__attendees">
                        {/* Show up to 3 avatar circles */}
                        {[...Array(Math.min(3, attendeeCount))].map((_, i) => (
                            <span key={i} className="ch-training-card__avatar">
                                <User size={14} />
                            </span>
                        ))}
                        {attendeeCount > 3 && (
                            <span className="ch-training-card__avatar ch-training-card__avatar--count">
                                +{attendeeCount - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingCard;
