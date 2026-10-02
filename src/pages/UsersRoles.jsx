import React from "react";
import { Plus } from "lucide-react";

export function UsersRoles({ setToast }) {
  const team = [
    { name: "Admin (You)", email: "admin@medistock.com", role: "Super Admin", access: "Full", status: "Active" },
    { name: "Dr. Sarah Chen", email: "schen@medistock.com", role: "Chief Pharmacist", access: "Read/Write", status: "Active" },
    { name: "Michael Vance", email: "mvance@medistock.com", role: "Inventory Clerk", access: "Restricted", status: "Offline" },
    { name: "Elena Rodriguez", email: "erodriguez@medistock.com", role: "Auditor", access: "Read-Only", status: "Active" },
  ];
  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">ACCESS CONTROL</span><h1>Users & Roles</h1><p>Manage staff accounts and permissions.</p></div>
      <button className="primary" onClick={() => setToast("Opening invite user modal...")}><Plus size={16}/> Invite user</button>
    </div>
    <div className="panel" style={{padding:0, overflow:"hidden"}}>
      <div className="data-table">
        <div className="table-head" style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr"}}>
           <span>User</span><span>Role</span><span>Access Level</span><span>Status</span><span>Actions</span>
        </div>
        {team.map(u=>(
          <div className="data-row" key={u.email} style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr"}}>
            <div className="med-cell"><div className="avatar" style={{background:u.status==="Offline"?"#f1f5f9":""}}>{u.name.split(" ")[0][0]}{u.name.split(" ")[1][0]}</div><div><b>{u.name}</b><span>{u.email}</span></div></div>
            <span><b>{u.role}</b></span>
            <span>{u.access}</span>
            <span style={{color: u.status==="Active"?"var(--green)":"var(--muted)"}}>● {u.status}</span>
            <span><button className="link-btn" onClick={() => setToast(`Editing permissions for ${u.name}`)}>Edit</button></span>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
