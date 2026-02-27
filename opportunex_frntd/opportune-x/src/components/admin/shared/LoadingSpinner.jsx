import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = '', fullPage = false }) {
  const px = { sm: 16, md: 28, lg: 42, xl: 56 }[size] || 28;

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <Loader2
        size={px}
        style={{ color: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}
      />
      {text && (
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }}>
      <div style={{ height: 14, background: 'var(--surface-2)', borderRadius: 3, width: '75%', marginBottom: 10 }} />
      <div style={{ height: 11, background: 'var(--surface-2)', borderRadius: 3, width: '50%', marginBottom: 8 }} />
      <div style={{ height: 11, background: 'var(--surface-2)', borderRadius: 3, width: '100%' }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} style={{ height: 28, background: 'var(--surface-2)', borderRadius: 3, flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
