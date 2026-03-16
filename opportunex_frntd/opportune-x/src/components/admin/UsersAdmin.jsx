import { useEffect, useState, useMemo } from "react";
import { Search, Trash2, Users, UserX, UserCheck, Edit, X, UserPlus } from "lucide-react";
import toast from '../common/toastManager';
import { getAllUsers, updateUser, deleteUser, deactivateUser, reactivateUser, createUser } from "../../services/adminService";
import LoadingSpinner from "./shared/LoadingSpinner";

const ROLE_TABS = ["All", "student", "company", "faculty", "admin"];

const STATUS_COLORS = {
    approved: { bg: "rgba(16,185,129,0.1)", color: "var(--green)", label: "Active" },
    pending: { bg: "rgba(224,155,61,0.1)", color: "var(--yellow)", label: "Pending" },
    rejected: { bg: "rgba(200,75,49,0.1)", color: "var(--red)", label: "Deactivated" },
};

export default function UsersAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleTab, setRoleTab] = useState("All");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "faculty"
    });

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await getAllUsers();
            setUsers(res.data || []);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchUsers(); }, []);

    const filtered = useMemo(() => {
        return users.filter(u => {
            const q = searchTerm.toLowerCase();
            const matchSearch = !searchTerm ||
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.collegeId?.toLowerCase().includes(q) ||
                u.mobile?.toLowerCase().includes(q) ||
                u.companyName?.toLowerCase().includes(q);
            const matchRole = roleTab === "All" || u.role === roleTab;
            return matchSearch && matchRole;
        });
    }, [users, searchTerm, roleTab]);

    async function handleDelete(id) {
        setActionLoading(id + "_delete");
        try {
            await deleteUser(id);
            toast.success("User permanently deleted");
            setConfirmDelete(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDeactivate(id, name) {
        setActionLoading(id + "_deactivate");
        try {
            await deactivateUser(id);
            toast.success(`${name} deactivated`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Deactivate failed");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReactivate(id, name) {
        setActionLoading(id + "_reactivate");
        try {
            await reactivateUser(id);
            toast.success(`${name} reactivated`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Reactivate failed");
        } finally {
            setActionLoading(null);
        }
    }

    function handleEditClick(user) {
        setEditUser(user);
        if (user.role === "company") {
            setEditFormData({
                companyName: user.companyName || "",
                name: user.name || "",
                email: user.email || "",
                website: user.website || "",
                mobile: user.mobile || ""
            });
        } else {
            setEditFormData({
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || ""
            });
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        setActionLoading(editUser._id + "_edit");
        try {
            await updateUser(editUser._id, editFormData);
            toast.success("User updated successfully");
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleAddSubmit(e) {
        e.preventDefault();
        setActionLoading("add_user");
        try {
            await createUser(addFormData);
            toast.success("User added successfully");
            setAddUserModalOpen(false);
            setAddFormData({ name: "", email: "", password: "", role: "faculty" });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add user");
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) return (
        <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
            <LoadingSpinner size="lg" text="Loading users..." />
        </div>
    );

    return (
        <div>
            <div className="page-title-block" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 className="page-title">User <em>Directory</em></h1>
                    <p className="page-subtitle">Search, filter, deactivate or permanently remove users.</p>
                </div>
                <button
                    onClick={() => setAddUserModalOpen(true)}
                    className="btn-primary"
                    style={{ padding: "8px 16px", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}
                >
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            {/* ── Role Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {ROLE_TABS.map(tab => {
                    let label = tab === "All" ? "All" : tab === "company" ? "Companies" : tab === "faculty" ? "Faculty" : tab.charAt(0).toUpperCase() + tab.slice(1) + "s";
                    return (
                        <button
                            key={tab}
                            onClick={() => setRoleTab(tab)}
                            style={{
                                padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                border: `1px solid ${roleTab === tab ? "var(--accent)" : "var(--border)"}`,
                                background: roleTab === tab ? "rgba(27,79,216,0.08)" : "var(--surface)",
                                color: roleTab === tab ? "var(--accent)" : "var(--text-muted)",
                                cursor: "pointer",
                                textTransform: "capitalize",
                            }}
                        >
                            {tab === "All" ? `All (${users.length})` : `${label} (${users.filter(u => u.role === tab).length})`}
                        </button>
                    );
                })}
            </div>

            {/* ── Search + count */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or institution ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ paddingLeft: 32, width: 320, height: 36 }}
                    />
                </div>
                <span className="panel-tag" style={{ marginLeft: "auto" }}>{filtered.length} users</span>
            </div>

            {/* ── Table */}
            <div className="panel">
                <div className="panel-body" style={{ padding: 0 }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                            <Users size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                            <p style={{ fontSize: 14 }}>No users match your search</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 20 }}>User</th>
                                    <th>Role</th>
                                    <th>Institution ID</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right", paddingRight: 20 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => {
                                    const statusCfg = STATUS_COLORS[user.status] || STATUS_COLORS.pending;
                                    return (
                                        <tr key={user._id}>
                                            <td style={{ paddingLeft: 20 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: 6,
                                                        background: "rgba(27,79,216,0.08)", color: "var(--accent)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontWeight: 700, fontSize: 13,
                                                    }}>
                                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{(user.role === "company" && user.companyName) ? user.companyName : user.name}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 6 }}>
                                                            <span>{user.email}</span>
                                                            {user.mobile && <span>• {user.mobile}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`pill pill-${user.role === "admin" ? "red" : user.role === "company" ? "blue" : user.role === "faculty" ? "purple" : ""}`}
                                                    style={{ fontSize: 10, textTransform: "capitalize" }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>
                                                    {user.collegeId || "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 20,
                                                    background: statusCfg.bg, color: statusCfg.color,
                                                    fontSize: 10, fontWeight: 700,
                                                }}>
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right", paddingRight: 20 }}>
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                                                    {/* Deactivate or Reactivate */}
                                                    {user.role !== "admin" && user.status !== "rejected" && (
                                                        <button
                                                            onClick={() => handleDeactivate(user._id, user.name)}
                                                            disabled={!!actionLoading}
                                                            title="Deactivate account"
                                                            style={{
                                                                padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                                                background: "rgba(224,155,61,0.1)", border: "1px solid rgba(224,155,61,0.25)",
                                                                color: "var(--yellow)", cursor: "pointer", fontWeight: 600,
                                                                display: "flex", alignItems: "center", gap: 4,
                                                            }}
                                                        >
                                                            <UserX size={12} />
                                                            {actionLoading === user._id + "_deactivate" ? "..." : "Deactivate"}
                                                        </button>
                                                    )}
                                                    {user.role !== "admin" && user.status === "rejected" && (
                                                        <button
                                                            onClick={() => handleReactivate(user._id, user.name)}
                                                            disabled={!!actionLoading}
                                                            title="Reactivate account"
                                                            style={{
                                                                padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                                                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                                                                color: "var(--green)", cursor: "pointer", fontWeight: 600,
                                                                display: "flex", alignItems: "center", gap: 4,
                                                            }}
                                                        >
                                                            <UserCheck size={12} />
                                                            {actionLoading === user._id + "_reactivate" ? "..." : "Reactivate"}
                                                        </button>
                                                    )}
                                                    {/* Permanent delete */}
                                                    {user.role !== "admin" && (
                                                        <button
                                                            onClick={() => setConfirmDelete(user)}
                                                            title="Permanently delete"
                                                            style={{
                                                                padding: "5px 8px", borderRadius: 6,
                                                                background: "rgba(200,75,49,0.08)", border: "1px solid rgba(200,75,49,0.2)",
                                                                color: "var(--red)", cursor: "pointer",
                                                                display: "flex", alignItems: "center",
                                                            }}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                    {/* Edit User */}
                                                    {(user.role === "student" || user.role === "company") && (
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            title="Edit User"
                                                            style={{
                                                                padding: "5px 8px", borderRadius: 6,
                                                                background: "rgba(27,79,216,0.08)", border: "1px solid rgba(27,79,216,0.2)",
                                                                color: "var(--accent)", cursor: "pointer",
                                                                display: "flex", alignItems: "center",
                                                            }}
                                                        >
                                                            <Edit size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {confirmDelete && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 24
                }}>
                    <div style={{ background: "var(--surface)", borderRadius: 12, padding: 28, maxWidth: 400, width: "100%", border: "1px solid var(--border)" }}>
                        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Permanently Delete User?</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                            This will permanently delete <strong>{confirmDelete.name}</strong> and all their data. This action cannot be undone.
                            <br /><br />
                            <span style={{ color: "var(--yellow)", fontSize: 12 }}>💡 Consider using <strong>Deactivate</strong> instead to preserve records.</span>
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setConfirmDelete(null)} className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Cancel</button>
                            <button
                                onClick={() => handleDelete(confirmDelete._id)}
                                disabled={!!actionLoading}
                                className="btn-danger"
                                style={{ padding: "8px 16px", fontSize: 13 }}
                            >
                                {actionLoading ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editUser && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 60,
                    background: "rgba(0,0,0,0.55)", display: "flex",
                    alignItems: "center", justifyContent: "center", padding: 24
                }}>
                    <div className="panel" style={{ width: "100%", maxWidth: 500, padding: "24px 32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>Edit {editUser.role === 'company' ? 'Company' : 'Student'} Profile</h2>
                            <button onClick={() => setEditUser(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {editUser.role === "company" && (
                                <div className="form-field">
                                    <label>Company Name</label>
                                    <input type="text" className="form-input"
                                        value={editFormData.companyName || ""}
                                        onChange={e => setEditFormData({ ...editFormData, companyName: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-field">
                                <label>{editUser.role === "company" ? "HR Contact Name" : "Name"}</label>
                                <input type="text" className="form-input"
                                    value={editFormData.name || ""}
                                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Email Address</label>
                                <input type="email" className="form-input"
                                    value={editFormData.email || ""}
                                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Mobile Number</label>
                                <input type="text" className="form-input"
                                    value={editFormData.mobile || ""}
                                    onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                                />
                            </div>
                            {editUser.role === "company" && (
                                <div className="form-field">
                                    <label>Website</label>
                                    <input type="url" className="form-input"
                                        value={editFormData.website || ""}
                                        onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                                    />
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                                <button type="button" onClick={() => setEditUser(null)} className="btn-ghost" disabled={!!actionLoading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!!actionLoading}>
                                    {actionLoading === editUser._id + "_edit" ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {addUserModalOpen && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 60,
                    background: "rgba(0,0,0,0.55)", display: "flex",
                    alignItems: "center", justifyContent: "center", padding: 24
                }}>
                    <div className="panel" style={{ width: "100%", maxWidth: 500, padding: "24px 32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>Add New User</h2>
                            <button onClick={() => setAddUserModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="form-field">
                                <label>Role</label>
                                <select className="form-input"
                                    value={addFormData.role}
                                    onChange={e => setAddFormData({ ...addFormData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="company">Company</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>{addFormData.role === "company" ? "Company Name (or HR Name)" : "Full Name"}</label>
                                <input type="text" className="form-input"
                                    value={addFormData.name}
                                    placeholder="Enter full name"
                                    onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Email Address</label>
                                <input type="email" className="form-input"
                                    value={addFormData.email}
                                    placeholder="user@example.com"
                                    onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Temporary Password</label>
                                <input type="text" className="form-input"
                                    value={addFormData.password}
                                    placeholder="e.g. Faculty@123"
                                    onChange={e => setAddFormData({ ...addFormData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                                <button type="button" onClick={() => setAddUserModalOpen(false)} className="btn-ghost" disabled={actionLoading === "add_user"}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={actionLoading === "add_user"}>
                                    {actionLoading === "add_user" ? "Adding..." : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
