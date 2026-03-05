import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Edit2, Trash2, Plus, X, Mail, Phone } from 'lucide-react';
import {
  getTpoContacts,
  addTpoContact,
  updateTpoContact,
  deleteTpoContact,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import EmptyState from "./shared/EmptyState";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_CONTACT = { name: "", designation: "", email: "", phone: "" };

export default function TpoContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [current, setCurrent] = useState(EMPTY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const res = await getTpoContacts();
      setContacts(res.data || []);
    } catch (err) {
      console.error("Failed to load contacts", err);
      toast.error("Failed to load TPO contacts");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.name?.trim() || !current.designation?.trim() || !current.email?.trim() || !current.phone?.trim()) {
      toast.error("All fields are required"); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(current.email)) { toast.error("Please enter a valid email address"); return; }
    try {
      setSaving(true);
      const payload = { ...current, role: current.designation };
      if (editingId) {
        await updateTpoContact(editingId, payload);
        toast.success("Contact updated successfully!");
      } else {
        await addTpoContact(payload);
        toast.success("Contact added successfully!");
      }
      setCurrent(EMPTY_CONTACT);
      setEditingId(null);
      fetchContacts();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(editingId ? "Failed to update contact" : "Failed to add contact");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(contact) {
    setCurrent({ name: contact.name || "", designation: contact.role || "", email: contact.email || "", phone: contact.phone || "" });
    setEditingId(contact._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() { setCurrent(EMPTY_CONTACT); setEditingId(null); }
  function openDeleteModal(contact) { setDeleteTarget(contact); setShowDeleteModal(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteTpoContact(deleteTarget._id);
      toast.success("Contact deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchContacts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete contact");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading TPO contacts..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">TPO <em>Contacts</em></h1>
        <p className="page-subtitle">Manage Training & Placement Officer contact details.</p>
      </div>

      {/* ADD/EDIT FORM */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <span className="panel-title">{editingId ? "Edit Contact" : "Add New Contact"}</span>
          {editingId && (
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="form-row-2" style={{ marginBottom: 12 }}>
            <input className="form-input" placeholder="Name *" value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} />
            <input className="form-input" placeholder="Designation / Role *" value={current.designation} onChange={(e) => setCurrent({ ...current, designation: e.target.value })} />
            <input className="form-input" type="email" placeholder="Email *" value={current.email} onChange={(e) => setCurrent({ ...current, email: e.target.value })} />
            <input className="form-input" type="tel" placeholder="Phone *" value={current.phone} onChange={(e) => setCurrent({ ...current, phone: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={handleSave} variant="primary" loading={saving} icon={editingId ? <Edit2 size={14} /> : <Plus size={14} />}>
              {editingId ? "Update Contact" : "Add Contact"}
            </Button>
            {editingId && <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>}
          </div>
        </div>
      </div>

      {/* LIST */}
      {contacts.length === 0 ? (
        <div className="panel"><EmptyState icon="users" title="No contacts yet" message="Add your first TPO contact to get started" /></div>
      ) : (
        <div className="grid-2">
          {contacts.map((c) => (
            <div key={c._id} className="panel">
              <div className="panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--accent)" }}>{c.role}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => handleEdit(c)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openDeleteModal(c)} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none" }}>
                    <Mail size={13} style={{ color: "var(--accent)" }} />{c.email}
                  </a>
                  <a href={`tel:${c.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none" }}>
                    <Phone size={13} style={{ color: "var(--accent)" }} />{c.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Contact" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}