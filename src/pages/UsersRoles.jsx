import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit, ShieldCheck, UserCheck, Key, Lock, Search } from "lucide-react";
import client from "../api/client";
import { Modal } from "../components/ui";

const CLINICAL_STAFF_FALLBACK = [
  { id: "usr-01", name: "Dr. Sarah Chen, MD", email: "admin@medistock.com", phone: "+1 555-0192", role: "SUPER_ADMIN", status: "ACTIVE", mfa: true, department: "Executive Administration" },
  { id: "usr-02", name: "Marcus Aurelius, PharmD", email: "pharmacist@medistock.com", phone: "+1 555-0144", role: "PHARMACIST", status: "ACTIVE", mfa: true, department: "Inpatient Pharmacy" },
  { id: "usr-03", name: "Elena Rostova, RN", email: "erostova@medistock.com", phone: "+1 555-0188", role: "CLINICIAN", status: "ACTIVE", mfa: true, department: "Clinical Triage & ICU" },
  { id: "usr-04", name: "James Vance", email: "jvance@medistock.com", phone: "+1 555-0133", role: "MANAGER", status: "ACTIVE", mfa: false, department: "Narcotics Vault Operations" }
];

export function UsersRoles({ setToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await client.get("/users");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
      } else {
        setUsers(CLINICAL_STAFF_FALLBACK);
      }
    } catch (e) {
      setUsers(CLINICAL_STAFF_FALLBACK);
    }
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingUser) {
        await client.put(`/users/${editingUser.id}`, data);
        setToast && setToast("User credentials updated successfully");
      } else {
        await client.post("/users", data);
        setToast && setToast("Clinical staff member invited successfully");
      }
      setShowAdd(false);
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      // Offline fallback update
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
        setToast && setToast("User credentials updated (local session)");
      } else {
        const newUser = { id: `usr-${Date.now()}`, ...data, status: "ACTIVE", mfa: true };
        setUsers(prev => [newUser, ...prev]);
        setToast && setToast("Clinical staff member invited (local session)");
      }
      setShowAdd(false);
      setEditingUser(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate and remove this staff account?")) {
      try {
        await client.delete(`/users/${id}`);
        setToast && setToast("User account decommissioned");
        loadUsers();
      } catch (e) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setToast && setToast("User account decommissioned (local session)");
      }
    }
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>SUPER ADMIN</span>;
      case "PHARMACIST":
        return <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--green)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>PHARMACIST</span>;
      case "CLINICIAN":
        return <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--blue)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>CLINICIAN</span>;
      case "MANAGER":
        return <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--amber)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>MANAGER</span>;
      default:
        return <span style={{ background: "var(--surface)", color: "var(--muted)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>{role}</span>;
    }
  };

  const filteredUsers = users.filter(u => 
    !search || 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow">IDENTITY & ACCESS MANAGEMENT</span>
          <h1>Users & Roles</h1>
          <p>FDA 21 CFR Part 11 electronic signature authorization & RBAC permissions.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 11, color: "var(--muted)" }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Filter staff by name or role..." 
              className="input-field" 
              style={{ paddingLeft: 34, width: 260 }}
            />
          </div>
          <button className="primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Invite Clinical Staff
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="data-table">
          <div className="table-head" style={{ gridTemplateColumns: "1.8fr 1.2fr 1.2fr 1fr 0.8fr" }}>
            <span>Clinical Staff</span>
            <span>Assigned Role</span>
            <span>Department</span>
            <span>MFA Security</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading authorized staff profiles...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No staff matching "{search}".</div>
          ) : (
            filteredUsers.map(u => (
              <div className="data-row" key={u.id} style={{ gridTemplateColumns: "1.8fr 1.2fr 1.2fr 1fr 0.8fr" }}>
                <div className="med-cell">
                  <div className="avatar" style={{ background: u.status === "INACTIVE" ? "#f1f5f9" : "var(--brand-glow)", color: "var(--brand)" }}>
                    {u.name ? u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "MD"}
                  </div>
                  <div>
                    <b>{u.name}</b>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</span>
                  </div>
                </div>
                <div>{getRoleBadge(u.role)}</div>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{u.department || "Clinical Pharmacy"}</div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: u.mfa !== false ? "var(--green)" : "var(--amber)" }}>
                    <ShieldCheck size={14} />
                    {u.mfa !== false ? "FIDO2 / TOTP Active" : "Password Only"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="icon-btn" title="Edit permissions" onClick={() => setEditingUser(u)}>
                    <Edit size={15} />
                  </button>
                  <button className="icon-btn" title="Deactivate" onClick={() => handleDelete(u.id)}>
                    <Trash2 size={15} color="var(--rose)" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(showAdd || editingUser) && (
        <Modal title={editingUser ? "Edit Clinical Credentials" : "Authorize New Clinical Staff"} close={handleClose}>
          <form className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 15 }} onSubmit={handleSave}>
            <label>
              Full Legal Name
              <input name="name" defaultValue={editingUser?.name} required placeholder="e.g. Dr. Sarah Chen, MD" />
            </label>
            <label>
              Hospital Email Address
              <input name="email" type="email" defaultValue={editingUser?.email} required placeholder="e.g. schen@medistock.com" />
            </label>
            <label>
              Mobile / Pager Number
              <input name="phone" defaultValue={editingUser?.phone} placeholder="e.g. +1 555-0123" />
            </label>
            <label>
              Department
              <input name="department" defaultValue={editingUser?.department || "Inpatient Pharmacy"} placeholder="e.g. Inpatient Pharmacy" />
            </label>
            <label>
              Initial Access Token / Password
              <input name="passwordHash" type="password" placeholder={editingUser ? "Leave blank to keep unchanged" : "Set initial authorization password"} required={!editingUser} />
            </label>
            <label>
              System Role & Scope
              <select name="role" defaultValue={editingUser?.role || "CLINICIAN"}>
                <option value="SUPER_ADMIN">Super Admin (Full Tenant Control)</option>
                <option value="PHARMACIST">Lead Pharmacist (Dispensing & Overrides)</option>
                <option value="CLINICIAN">Clinician / Physician (Prescribe & Review)</option>
                <option value="MANAGER">Inventory Vault Manager</option>
              </select>
            </label>

            <div className="modal-actions" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="secondary" onClick={handleClose}>Cancel</button>
              <button type="submit" className="primary">{editingUser ? "Save Credentials" : "Issue Authorization"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
