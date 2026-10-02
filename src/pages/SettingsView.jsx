import React from "react";
import { Settings, Bell, ShieldCheck, Sparkles } from "lucide-react";

export function SettingsView() {
  return <div className="page">
    <div className="page-heading">
       <div><span className="eyebrow">CONFIGURATION</span><h1>Settings</h1><p>Manage your workspace preferences.</p></div>
       <button className="primary">Save Changes</button>
    </div>
    <div className="panel" style={{display:"flex", gap:30}}>
       <div className="settings-nav" style={{display:"flex", flexDirection:"column", gap:5, minWidth:200}}>
          <button className="nav-item active"><Settings size={16}/><span>General</span></button>
          <button className="nav-item"><Bell size={16}/><span>Notifications</span></button>
          <button className="nav-item"><ShieldCheck size={16}/><span>Security</span></button>
          <button className="nav-item"><Sparkles size={16}/><span>AI Features</span></button>
       </div>
       <div className="settings-content" style={{flex:1, display:"flex", flexDirection:"column", gap:20}}>
          <div><h3>Workspace Name</h3><input className="input-field" defaultValue="MediStock Central Pharmacy" /></div>
          <div><h3>Timezone</h3><select className="input-field"><option>Asia/Kolkata (IST)</option><option>UTC</option></select></div>
          <div style={{borderTop:"1px solid var(--line)", paddingTop:20, marginTop:10}}>
             <label style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
               <div><b>AI Auto-Drafting</b><p style={{margin:"2px 0 0", fontSize:11, color:"var(--muted)"}}>Allow AI to draft purchase orders automatically</p></div>
               <input type="checkbox" defaultChecked className="toggle" />
             </label>
          </div>
          <div style={{borderTop:"1px solid var(--line)", paddingTop:20}}>
             <label style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
               <div><b>Two-Factor Authentication</b><p style={{margin:"2px 0 0", fontSize:11, color:"var(--muted)"}}>Require 2FA for all administrative accounts</p></div>
               <input type="checkbox" defaultChecked className="toggle" />
             </label>
          </div>
       </div>
    </div>
  </div>;
}
