import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit } from "lucide-react";
import client from "../api/client";
import { Modal } from "../components/ui";

export function UsersRoles({ setToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await client.get("/users");
      setUsers(res.data);
    } catch (e) {
      setToast("Failed to load users");
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
        setToast("User updated successfully");
      } else {
        await client.post("/users", data);
        setToast("User invited successfully");
      }
      setShowAdd(false);
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      setToast("Failed to save user");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await client.delete(`/users/${id}`);
        setToast("User deleted successfully");
        loadUsers();
      } catch (e) {
        setToast("Failed to delete user");
      }
    }
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditingUser(null);
  };

  // Helper to map roles to access level
  const getAccessLevel = (role) => {
    if (role === 'SUPER_ADMIN') return 'Full System Access';
    if (role === 'PHARMACIST' || role === 'MANAGER') return 'Read/Write';
    if (role === 'CLINICIAN') return 'Restricted Write';
    return 'Read-Only';
  };

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCESS CONTROL</span>
          <h1>Users & Roles</h1>
          <p>Manage staff accounts and permissions.</p>
        </div>
        <button className="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Invite user
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="data-table">
          <div className="table-head" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr" }}>
            <span>User</span>
            <span>Role</span>
            <span>Access Level</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No users found.</div>
          ) : (
            users.map(u => (
              <div className="data-row" key={u.id} style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr" }}>
                <div className="med-cell">
                  <div className="avatar" style={{ background: u.status === "INACTIVE" ? "#f1f5f9" : "" }}>
                    {u.name ? u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "?"}
                  </div>
                  <div>
                    <b>{u.name}</b>
                    <span>{u.email}</span>
                  </div>
                </div>
                <span>
                  <b>{u.role ? u.role.replace('_', ' ') : 'UNKNOWN'}</b>
                </span>
                <span>{getAccessLevel(u.role)}</span>
                <span style={{ color: u.status === "ACTIVE" ? "var(--green)" : "var(--muted)" }}>
                  ● {u.status || "ACTIVE"}
                </span>
                <span style={{ display: "flex", gap: 10 }}>
                  <button className="icon-btn" onClick={() => setEditingUser(u)}>
                    <Edit size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(u.id)}>
                    <Trash2 size={15} color="var(--rose)" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {(showAdd || editingUser) && (
        <Modal title={editingUser ? "Edit User" : "Invite User"} close={handleClose}>
          <form className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 15 }} onSubmit={handleSave}>
            <label>
              Full Name
              <input name="name" defaultValue={editingUser?.name} required placeholder="e.g. Dr. Sarah Chen" />
            </label>
            <label>
              Email Address
              <input name="email" type="email" defaultValue={editingUser?.email} required placeholder="e.g. schen@medistock.com" />
            </label>
            <label>
              Phone Number
              <input name="phone" defaultValue={editingUser?.phone} placeholder="e.g. +1 555-0123" />
            </label>
            <label>
              Password
              <input name="passwordHash" type="password" placeholder={editingUser ? "Leave blank to keep unchanged" : "Set initial password"} required={!editingUser} />
            </label>
            <label>
              Role
              <select name="role" defaultValue={editingUser?.role || "CLINICIAN"}>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="CLINICIAN">Clinician</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={editingUser?.status || "ACTIVE"}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / Offline</option>
              </select>
            </label>

            <div className="modal-actions" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="secondary" onClick={handleClose}>Cancel</button>
              <button type="submit" className="primary">{editingUser ? "Save Changes" : "Send Invite"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
