import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markAllRead, markOneRead } = useSocket();
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: 'relative' }}>

            {/* Bell Icon */}
            <button
                onClick={() => { setOpen(!open); markAllRead() }}
                style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '8px', cursor: 'pointer',
                    position: 'relative', display: 'flex', alignItems: 'center'
                }}
            >
                <span>🔔</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        background: 'var(--red)', color: 'white',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '10px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '44px',
                    width: '320px', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
                }}>

                    {/* Header */}
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>
                            Notifications
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {unreadCount} unread
                        </span>
                    </div>

                    {/* Notification List */}
                    {notifications.length === 0 ? (
                        <div style={{
                            padding: '24px', textAlign: 'center',
                            color: 'var(--text-muted)', fontSize: '12px'
                        }}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id}
                                onClick={() => markOneRead(n.id)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--border)',
                                    background: n.read ? 'transparent' : 'var(--surface-2)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '12.5px', marginBottom: '3px', color: 'var(--text)' }}>
                                    {n.message}
                                </div>
                                <div style={{
                                    fontSize: '10px', color: 'var(--text-muted)',
                                    fontFamily: 'DM Mono, monospace'
                                }}>
                                    {new Date(n.receivedAt).toLocaleTimeString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
