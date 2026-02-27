import { Loader2 } from 'lucide-react';

/**
 * Shared Button - maps variant prop to the design system's CSS classes.
 * Used widely in placement admin sub-components.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  // Map old variants → design-system classes
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-ghost',
    ghost: 'btn-ghost',
    danger: 'btn-primary',   // use btn-primary but override background below
    success: 'btn-primary',
  }[variant] || 'btn-primary';

  const dangerStyle = variant === 'danger' ? { background: 'var(--red)' } : {};
  const successStyle = variant === 'success' ? { background: 'var(--green)' } : {};
  const sizeStyle = {
    sm: { padding: '5px 12px', fontSize: 11.5 },
    md: { padding: '8px 18px', fontSize: 13 },
    lg: { padding: '10px 24px', fontSize: 14 },
  }[size] || {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: fullWidth ? '100%' : undefined,
        ...sizeStyle,
        ...dangerStyle,
        ...successStyle,
        opacity: (disabled || loading) ? 0.55 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
