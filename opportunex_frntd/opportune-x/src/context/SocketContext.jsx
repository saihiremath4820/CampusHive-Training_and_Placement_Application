import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getNotifications, markAsRead, clearAllNotifications } from '../services/notificationService';

const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setSocket(null);
            return;
        }

        const { id: userId, role, collegeId } = user;

        // Load initial notifications
        getNotifications().then(res => {
            const formatted = (res.data || []).map(n => ({
                id: n._id,
                ...n,
                read: n.isRead,
                receivedAt: n.createdAt
            }));
            setNotifications(formatted);
            setUnreadCount(formatted.filter(n => !n.read).length);
        }).catch(err => console.error("Socket history fetch err:", err));

        // Connect to backend
        const newSocket = io(
            import.meta.env.VITE_API_BASE?.replace('/api', ''),
            { 
              withCredentials: true,
              transports: ['websocket', 'polling']
            }
        );
        
        // Join personal + role room
        newSocket.emit('join', {
            userId,
            role,
            collegeId
        });

        // Listen for all notification types
        const notificationEvents = [
            'new_application',
            'application_status_update',
            'new_job_posted',
            'student_profile_updated',
            'roadmap_ready',
            'application_update',
            'drive_submitted',
            'drive_approved',
            'drive_rejected',
            'submission_approved'
        ];

        notificationEvents.forEach(event => {
            newSocket.on(event, (data) => {
                const notification = {
                    id: data._id || Date.now(),
                    ...data,
                    read: data.isRead || false,
                    receivedAt: data.createdAt || new Date()
                };
                setNotifications(prev => [notification, ...prev].slice(0, 50));
                setUnreadCount(prev => prev + 1);

                // Browser notification if permitted
                if (Notification.permission === 'granted') {
                    try {
                        new Notification('CampusHive', {
                            body: data.message,
                            icon: '/vite.svg'
                        });
                    } catch (e) { }
                }
            });
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [user?.id]);

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await clearAllNotifications();
        } catch (e) { console.error(e); }
    };

    const markOneRead = async (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await markAsRead(id);
        } catch (e) { console.error(e); }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            notifications,
            unreadCount,
            markAllRead,
            markOneRead
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
