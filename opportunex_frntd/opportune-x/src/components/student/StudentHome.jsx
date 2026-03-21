import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Users, 
  ChevronRight,
  User,
  Map
} from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const { profile, applications, opportunities } = useStudent();
  const setActiveView = onNavigate;

  const stats = [
    {
      label: 'Applications',
      value: applications?.length || 0,
      icon: <FileText size={20} />,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)'
    },
    {
      label: 'Shortlisted',
      value: applications?.filter(a => a.status === 'Shortlisted').length || 0,
      icon: <Users size={20} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)'
    },
    {
      label: 'Selected',
      value: applications?.filter(a => a.status === 'Selected').length || 0,
      icon: <CheckCircle size={20} />,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)'
    },
    {
      label: 'Open Drives',
      value: opportunities?.length || 0,
      icon: <Briefcase size={20} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)'
    },
  ];

  return (
    <div className="student-home">

      {/* Welcome Banner */}
      <div className="home-welcome">
        <div>
          <h2 className="home-title">
            Welcome back, {profile?.fullName?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="home-subtitle">
            Here is your placement journey at a glance
          </p>
        </div>
        <div className="home-date">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Grid — 2x2 */}
      <div className="home-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="home-stat-card">
            <div className="home-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="home-stat-info">
              <span className="home-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="home-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row — Quick Actions + Pro Tip side by side */}
      <div className="home-bottom-row">

        {/* Quick Actions */}
        <div className="home-card home-actions">
          <h3 className="home-card-title">Quick Actions</h3>
          <div className="home-action-list">
            <button className="home-action-item" onClick={() => setActiveView('opportunities')}>
              <div className="home-action-icon">
                <Briefcase size={18} />
              </div>
              <div className="home-action-text">
                <span className="home-action-name">Browse Jobs</span>
                <span className="home-action-desc">
                  {opportunities?.length || 0} new matching opportunities
                </span>
              </div>
              <ChevronRight size={16} className="home-action-arrow" />
            </button>

            <button className="home-action-item" onClick={() => setActiveView('profile')}>
              <div className="home-action-icon">
                <User size={18} />
              </div>
              <div className="home-action-text">
                <span className="home-action-name">Update Profile</span>
                <span className="home-action-desc">Complete your profile to stand out</span>
              </div>
              <ChevronRight size={16} className="home-action-arrow" />
            </button>

            <button className="home-action-item" onClick={() => setActiveView('roadmap')}>
              <div className="home-action-icon">
                <Map size={18} />
              </div>
              <div className="home-action-text">
                <span className="home-action-name">View Roadmap</span>
                <span className="home-action-desc">Track your learning journey</span>
              </div>
              <ChevronRight size={16} className="home-action-arrow" />
            </button>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="home-card home-protip">
          <div className="home-protip-header">
            <span className="home-protip-badge">Pro Tip</span>
          </div>
          <p className="home-protip-text">
            Students with 100% profile completeness are 3x more likely
            to be shortlisted by top companies. Make sure to upload
            your latest resume!
          </p>
          <button
            className="home-protip-btn"
            onClick={() => setActiveView('profile')}
          >
            Finish Profile →
          </button>
        </div>

      </div>
    </div>
  );
}
