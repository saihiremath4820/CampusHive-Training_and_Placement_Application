import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import './Toast.css';

const Toast = ({ id, type, title, message, onClose, duration }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for slide-out animation to finish
    };

    const config = {
        success: {
            wave: '#2563eb1a',
            iconBg: '#2563eb22',
            iconColor: '#2563eb',
            titleColor: '#1d4ed8',
            Icon: CheckCircle2,
        },
        error: {
            wave: '#ef44441a',
            iconBg: '#ef444422',
            iconColor: '#ef4444',
            titleColor: '#dc2626',
            Icon: XCircle,
        },
        warning: {
            wave: '#f59e0b1a',
            iconBg: '#f59e0b22',
            iconColor: '#f59e0b',
            titleColor: '#d97706',
            Icon: AlertTriangle,
        },
        info: {
            wave: '#8b5cf61a',
            iconBg: '#8b5cf622',
            iconColor: '#8b5cf6',
            titleColor: '#7c3aed',
            Icon: Info,
        }
    };

    const c = config[type] || config.success;
    const IconComponent = c.Icon;

    if (!IconComponent) return null; // Safety check

    return (
        <div className={`ch-toast ${isClosing ? 'ch-toast--closing' : ''}`} style={{ borderLeftColor: c.iconColor }}>
            {/* Wave decoration — left side */}
            <svg className="ch-toast__wave" viewBox="0 0 1440 320" style={{ fill: c.wave }}>
                <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L0,320Z" />
            </svg>

            {/* Icon */}
            <div className="ch-toast__icon-wrap" style={{ backgroundColor: c.iconBg }}>
                <IconComponent size={20} color={c.iconColor} />
            </div>

            {/* Text */}
            <div className="ch-toast__text">
                <p className="ch-toast__title" style={{ color: c.titleColor }}>{title}</p>
                <p className="ch-toast__sub">{message}</p>
            </div>

            {/* Close button */}
            <button className="ch-toast__close" onClick={handleClose}>✕</button>
        </div>
    );
};

export default Toast;
