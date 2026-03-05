import { useState } from "react";

const ApplyModal = ({ opportunity, onConfirm, onCancel }) => {
    const required = opportunity.dataRequirements || [];

    // Extra fields beyond resume/cgpa/contact
    const extraFields = required.filter(r =>
        !['Resume', 'CGPA', 'Contact Number'].includes(r)
    );

    const [formData, setFormData] = useState({
        githubUrl: '',
        linkedinUrl: '',
        hasBacklog: null,
        statementOfPurpose: ''
    });

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)"
        }}>
            <div className="panel" style={{
                width: "100%",
                maxWidth: "30rem",
                padding: "2rem",
                maxHeight: "90vh",
                overflowY: "auto"
            }}>
                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", color: "var(--text)" }}>
                    Apply for {opportunity.title}
                </h2>
                <p style={{ margin: "0 0 1.5rem", color: "var(--text)", opacity: 0.6, fontSize: "0.9rem" }}>
                    {opportunity.companyName}
                </p>

                {/* Always shown — confirmation */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        ✅ Automatically Included
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {required.includes('Resume') && (
                            <span className="pill pill-green">📄 Your Resume</span>
                        )}
                        {required.includes('CGPA') && (
                            <span className="pill pill-green">🎓 Your CGPA</span>
                        )}
                        {required.includes('Contact Number') && (
                            <span className="pill pill-green">📞 Your Contact</span>
                        )}
                    </div>
                </div>

                {/* Extra required fields */}
                {extraFields.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.95rem", color: "var(--text)", marginBottom: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                            📋 Additional Required Information
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {required.includes('GitHub/Portfolio') && (
                                <div className="form-field">
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem" }}>GitHub / Portfolio URL *</label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/yourusername"
                                        value={formData.githubUrl}
                                        onChange={e => setFormData({
                                            ...formData, githubUrl: e.target.value
                                        })}
                                        style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                                    />
                                </div>
                            )}

                            {required.includes('LinkedIn Profile') && (
                                <div className="form-field">
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem" }}>LinkedIn Profile URL *</label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({
                                            ...formData, linkedinUrl: e.target.value
                                        })}
                                        style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                                    />
                                </div>
                            )}

                            {required.includes('Backlog History') && (
                                <div className="form-field">
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Do you have any backlogs? *</label>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                            <input
                                                type="radio"
                                                name="backlog"
                                                value="false"
                                                checked={formData.hasBacklog === false}
                                                onChange={() => setFormData({
                                                    ...formData, hasBacklog: false
                                                })}
                                            />
                                            No backlogs
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                            <input
                                                type="radio"
                                                name="backlog"
                                                value="true"
                                                checked={formData.hasBacklog === true}
                                                onChange={() => setFormData({
                                                    ...formData, hasBacklog: true
                                                })}
                                            />
                                            Yes, I have backlogs
                                        </label>
                                    </div>
                                </div>
                            )}

                            {required.includes('Statement of Purpose') && (
                                <div className="form-field">
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem" }}>Statement of Purpose *</label>
                                    <textarea
                                        placeholder="Explain why you are a good fit for this role..."
                                        rows={4}
                                        value={formData.statementOfPurpose}
                                        onChange={e => setFormData({
                                            ...formData, statementOfPurpose: e.target.value
                                        })}
                                        style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", resize: "vertical" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
                    <button
                        onClick={onCancel}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(formData)}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                        Submit Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyModal;
