import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Clock, Info, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationIcon({ darkMode }) {
    const { notifications, unreadCount, markAllRead, markOneRead } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        markOneRead(id);
    };

    const handleClearAll = async () => {
        markAllRead();
    };

    const getIcon = (type) => {
        switch (type) {
            case "success": return <CheckCircle2 size={16} />;
            case "warning": return <AlertCircle size={16} />;
            case "error": return <XCircle size={16} />;
            default: return <Info size={16} />;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case "success": return { bg: "rgba(45, 106, 79, 0.1)", color: "var(--green)" };
            case "warning": return { bg: "rgba(224, 155, 61, 0.1)", color: "var(--yellow)" };
            case "error": return { bg: "rgba(200, 75, 49, 0.1)", color: "var(--red)" };
            default: return { bg: "rgba(27, 79, 216, 0.1)", color: "var(--accent)" };
        }
    };

    return (
        <div className="relative" ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="topbar-icon-btn"
                style={{ position: "relative" }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 8,
                        height: 8,
                        background: "var(--red)",
                        border: "2px solid var(--surface)",
                        borderRadius: "50%"
                    }}></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            marginTop: 10,
                            width: 320,
                            maxHeight: 450,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            zIndex: 100,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden"
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: "14px 18px",
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--surface-2)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <h3 style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, color: "var(--text-muted)" }}>
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 12
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleClearAll}
                                style={{
                                    background: "none", border: "none", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px"
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: "auto", minHeight: 150 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                                    <Bell size={32} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                                    <p style={{ fontSize: 13, fontWeight: 500 }}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const colors = getColors(n.type);
                                    return (
                                        <div
                                            key={n.id}
                                            style={{
                                                padding: "16px 18px",
                                                borderBottom: "1px solid var(--surface-2)",
                                                display: "flex",
                                                gap: 14,
                                                alignItems: "flex-start",
                                                background: !n.read ? "rgba(27,79,216,0.03)" : "transparent",
                                                position: "relative"
                                            }}
                                        >
                                            {!n.read && (
                                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)" }} />
                                            )}

                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, background: colors.bg, color: colors.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2
                                            }}>
                                                {getIcon(n.type)}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                                                    <p style={{ fontSize: 13, fontWeight: !n.read ? 600 : 500, color: "var(--text)", lineHeight: 1.4 }}>
                                                        {n.message}
                                                    </p>
                                                    {!n.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(n.id)}
                                                            style={{
                                                                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, flexShrink: 0
                                                            }}
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                                                    <Clock size={10} />
                                                    {formatDistanceToNow(new Date(n.createdAt || n.receivedAt), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: 12, textAlign: "center", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
                            <button style={{
                                background: "none", border: "none", fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer"
                            }}>
                                View all activity
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
