import React, { useState } from 'react';

export default function ExpandableText({ text, maxChars = 180, style }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    const isLong = text.length > maxChars;
    const displayText = isLong && !isExpanded ? text.slice(0, maxChars) + '...' : text;

    // Extract marginBottom from style to apply it to the wrapper instead of the p tag directly
    const { marginBottom, ...pStyle } = style || {};

    return (
        <div style={{ marginBottom: marginBottom || "20px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <p style={{ ...pStyle, margin: 0, paddingBottom: isLong ? "4px" : "0px", whiteSpace: "pre-wrap" }}>
                {displayText}
            </p>
            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: "transparent", border: "none", padding: "4px 0 0 0",
                        color: "var(--accent)", fontSize: "12.5px", fontWeight: 600,
                        cursor: "pointer", transition: "opacity 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.opacity = 0.7}
                    onMouseOut={(e) => e.target.style.opacity = 1}
                >
                    {isExpanded ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
}
