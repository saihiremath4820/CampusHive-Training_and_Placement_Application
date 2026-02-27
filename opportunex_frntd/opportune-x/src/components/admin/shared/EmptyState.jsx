import { FileX, Users, Briefcase, FileText, Building2 } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No data found',
  message = 'Get started by adding your first item',
  icon = 'file',
  actionText = null,
  onAction = null,
}) {
  const icons = {
    file: <FileX size={40} />,
    users: <Users size={40} />,
    briefcase: <Briefcase size={40} />,
    document: <FileText size={40} />,
    building: <Building2 size={40} />,
  };

  const displayIcon = typeof icon === 'string' ? icons[icon] : icon;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 20px',
      textAlign: 'center',
    }}>
      <div style={{ color: 'var(--border)', marginBottom: 14 }}>{displayIcon}</div>
      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, marginBottom: 20 }}>
        {message}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">{actionText}</Button>
      )}
    </div>
  );
}
