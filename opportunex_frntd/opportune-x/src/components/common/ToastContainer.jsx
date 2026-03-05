import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import toastManager from './toastManager';

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        console.log('ToastContainer mounted and subscribing...');
        // Subscribe to toast events
        const unsubscribe = toastManager.subscribe((newToast) => {
            console.log('ToastContainer received:', newToast);
            if (newToast.type === 'dismiss') {
                handleClose(newToast.id);
            } else {
                setToasts((currentToasts) => [...currentToasts, newToast]);
            }
        });

        return () => {
            console.log('ToastContainer unmounting...');
            unsubscribe();
        };
    }, []);

    const handleClose = (id) => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none', // Allow clicking through the container
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                    <Toast
                        id={toast.id}
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={() => handleClose(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
