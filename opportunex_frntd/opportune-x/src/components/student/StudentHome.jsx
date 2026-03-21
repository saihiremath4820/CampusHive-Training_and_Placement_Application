import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  ArrowRight,
  UserCircle,
  Map
} from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const { profile, applications } = useStudent();
  const firstName = profile?.fullName?.split(' ')[0] || 'Student';

  const stats = [
    { label: 'Applications', value: applications?.length || 0, icon: FileText, color: '#6366f1' },
    { label: 'Shortlisted', value: applications?.filter(a => a.status === 'Shortlisted').length || 0, icon: Users, color: '#f59e0b' },
    { label: 'Selected', value: applications?.filter(a => a.status === 'Selected').length || 0, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Open Drives', value: '12', icon: Briefcase, color: '#0ea5e9' }, // Hardcoded for demo if not available
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem' }}>
          Welcome back, {firstName} <span style={{ opacity: 0.8 }}>👋</span>
        </h1>
        <p style={{ color: 'var(--text)', opacity: 0.5, fontWeight: 500, margin: 0 }}>
          Here's what's happening with your placement preparations today.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '3rem', height: '3rem', borderRadius: '0.75rem', 
              background: `${stat.color}15`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <stat.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', opacity: 0.5, margin: 0, textTransform: 'uppercase' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Actions */}
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ActionButton 
              icon={Briefcase} 
              label="Browse Jobs" 
              desc="View 12 new matching opportunities"
              onClick={() => onNavigate('opportunities')} 
            />
            <ActionButton 
              icon={UserCircle} 
              label="Update Profile" 
              desc="Complete your profile to stand out"
              onClick={() => onNavigate('profile')} 
            />
            <ActionButton 
              icon={Map} 
              label="View Roadmap" 
              desc="Next step: Master System Design"
              onClick={() => onNavigate('roadmap')} 
            />
          </div>
        </div>

        {/* Tips / Recent Activity Placeholder */}
        <div className="panel" style={{ padding: '1.5rem', background: 'var(--accent)', color: '#fff' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Pro Tip 💡</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '1.5rem' }}>
            Students with 100% profile completeness are 3x more likely to be shortlisted by top companies. Make sure to upload your latest resume!
          </p>
          <button 
            onClick={() => onNavigate('profile')}
            style={{ 
              padding: '0.75rem 1.25rem', borderRadius: '0.75rem', 
              background: '#fff', color: 'var(--accent)', border: 'none',
              fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            Finish Profile <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, desc, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s'
      }}
      className="action-btn"
    >
      <div style={{ color: 'var(--accent)' }}><Icon size={18} /></div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.5, margin: 0 }}>{desc}</p>
      </div>
      <ArrowRight size={14} style={{ opacity: 0.3 }} />
    </button>
  );
}
