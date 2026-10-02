import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell,
  Boxes, CalendarClock, ChevronRight, CircleHelp, ClipboardList, Clock3,
  Download, FileText, Filter, HeartPulse, LayoutDashboard, LogOut,
  Menu, Moon, PackageSearch, Plus, RefreshCw, Search, Settings, ShieldCheck,
  ShoppingCart, Sparkles, Sun, Truck, Users, X, Zap, Map, Send, Play, MapPin, Undo2, TrendingDown, Camera, ShieldAlert, ThermometerSnowflake, BrainCircuit, Server, Wrench, GitMerge, Radio
} from "lucide-react";
import "./styles.css";
import { Dashboard } from "./pages/Dashboard";
import { CommandCenter } from "./pages/CommandCenter";
import { PharmacyOperations } from "./pages/PharmacyOperations";
import { FinancialIntelligence } from "./pages/FinancialIntelligence";
import { PredictiveRisk } from "./pages/PredictiveRisk";
import { Inventory } from "./pages/Inventory";
import { Batches } from "./pages/Batches";
import { Purchases } from "./pages/Purchases";
import { Suppliers } from "./pages/Suppliers";
import { ShelfMap } from "./pages/ShelfMap";
import { Movements } from "./pages/Movements";
import { Today } from "./pages/Today";
import { Administration } from "./pages/Administration";
import { OrganizationSwitcher } from "./components/OrganizationSwitcher";
import { QualityControl } from "./pages/QualityControl";
import { AIOperationsCenter } from "./pages/AIOperationsCenter";
import { LogisticsCommandCenter } from "./pages/LogisticsCommandCenter";
import { LogisticsOperations } from "./pages/LogisticsOperations";
import { SmartFacilityCenter } from "./pages/SmartFacilityCenter";
import { VisionReviewQueue } from "./pages/VisionReviewQueue";
import { MaintenanceCenter } from "./pages/MaintenanceCenter";
import { WarehouseDigitalTwin } from "./pages/WarehouseDigitalTwin";
import { SystemHealth } from "./pages/SystemHealth";
import { ErrorManagement } from "./pages/ErrorManagement";
import { ScenarioPlanning } from "./pages/ScenarioPlanning";
import { ControlTower } from "./pages/ControlTower";

const medicines = [
  { id: "MED-1042", name: "Amoxicillin 500mg", category: "Antibiotic", batch: "AMX-24F8", stock: 820, reorder: 300, expiry: "2027-04-18", supplier: "Cureline Pharma", status: "Healthy", price: 4.8 },
  { id: "MED-1043", name: "Paracetamol 500mg", category: "Analgesic", batch: "PCM-25A1", stock: 1460, reorder: 500, expiry: "2027-01-22", supplier: "MedCore Labs", status: "Healthy", price: 1.9 },
  { id: "MED-1044", name: "Azithromycin 250mg", category: "Antibiotic", batch: "AZI-24K3", stock: 182, reorder: 250, expiry: "2026-11-14", supplier: "NovaMed", status: "Low stock", price: 8.2 },
  { id: "MED-1045", name: "Insulin Glargine", category: "Diabetes", batch: "INS-26B4", stock: 74, reorder: 100, expiry: "2026-10-26", supplier: "BioNova", status: "Expiring", price: 29.5 },
  { id: "MED-1046", name: "Atorvastatin 20mg", category: "Cardiology", batch: "ATR-25C7", stock: 512, reorder: 200, expiry: "2027-08-02", supplier: "MedCore Labs", status: "Healthy", price: 3.4 },
  { id: "MED-1047", name: "Omeprazole 20mg", category: "Gastro", batch: "OMP-25D2", stock: 96, reorder: 180, expiry: "2026-12-08", supplier: "Cureline Pharma", status: "Low stock", price: 2.7 },
  { id: "MED-1048", name: "Ceftriaxone 1g", category: "Antibiotic", batch: "CEF-26A5", stock: 48, reorder: 80, expiry: "2026-10-19", supplier: "NovaMed", status: "Expiring", price: 12.4 },
  { id: "MED-1049", name: "Metformin 500mg", category: "Diabetes", batch: "MET-25H6", stock: 930, reorder: 400, expiry: "2027-06-11", supplier: "BioNova", status: "Healthy", price: 1.6 }
];

const activities = [
  ["Inventory received", "240 units of Paracetamol 500mg", "8 min ago", "in"],
  ["Low-stock alert", "Azithromycin 250mg reached reorder point", "34 min ago", "warn"],
  ["Purchase order", "PO-2026-184 sent to BioNova", "1 hr ago", "out"],
  ["Batch updated", "INS-26B4 expiry verified", "2 hrs ago", "check"]
];

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / 86400000);
}

function Status({ value }) {
  return <span className={`status ${value.toLowerCase().replace(/\s/g, "-")}`}>{value}</span>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@medistock.com");
  const [password, setPassword] = useState("admin123");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  return (
    <div className="auth-shell">
      <div className="auth-art">
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="brand-lockup"><div className="brand-mark"><HeartPulse size={25}/></div><span>MediStock<span style={{color: 'var(--brand)'}}>Pro</span></span></div>
        <div className="auth-copy drop-shadow-2xl">
          <span className="eyebrow" style={{color: 'var(--brand)', background: 'rgba(27, 180, 162, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(27, 180, 162, 0.2)'}}>ENTERPRISE HEALTHCARE PLATFORM</span>
          <h1>Intelligent inventory,<br/><span style={{color: 'var(--brand)'}}>zero compromises.</span></h1>
          <p>Manage your entire medical supply chain with AI-powered forecasting, robust FEFO enforcement, and real-time cold chain monitoring.</p>
          <div className="trust-row bg-slate-900/60 backdrop-blur-md rounded px-3 py-1 mt-4 inline-flex"><ShieldCheck size={17} color="var(--brand)"/> SOC2 Compliant <span>•</span> <Activity size={17} color="var(--brand)"/> 99.99% Uptime</div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form">
          <div className="mobile-brand"><div className="brand-mark"><HeartPulse size={23}/></div><b>MediStock</b></div>
          <span className="eyebrow">{isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Register a new workspace" : "Sign in to your workspace"}</h2>
          <p className="muted">{isRegister ? "Join to start managing your inventory." : "Sign in to your enterprise workspace."}</p>
          
          {isRegister && <label>Full Name<input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="John Doe" /></label>}
          <label>Work email<input value={email} onChange={e=>setEmail(e.target.value)} type="email"/></label>
          <label>Password
             <input value={password} onChange={e=>setPassword(e.target.value)} type="password"/>
             {!isRegister && <button className="link-btn" style={{position: 'absolute', right: 0, top: 0, marginTop: '-24px'}}>Forgot password?</button>}
          </label>
          {!isRegister && (
            <div className="form-row">
              <label className="checkbox"><input type="checkbox" defaultChecked/> Remember me for 30 days</label>
            </div>
          )}
          <button className="primary full" onClick={onLogin}>{isRegister ? "Register" : "Sign In"} <ChevronRight size={17}/></button>
          
          <div style={{textAlign: 'center', marginTop: '16px', fontSize: '14px'}}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button className="link-btn" onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Sign in" : "Register here"}</button>
          </div>

          <div className="demo-note" style={{background: 'rgba(27, 180, 162, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(27, 180, 162, 0.2)', marginTop: '16px'}}>
            <Sparkles size={15}/><span>Demo credentials pre-filled. Click {isRegister ? "Register" : "Sign In"} to explore.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {
  const groups = [
    { title: "Workspace", items: [["Control Tower", Radio], ["Command Center", LayoutDashboard], ["Pharmacy Ops", HeartPulse], ["Logistics Network", Map], ["Logistics Ops", Truck], ["Inventory", Boxes], ["Shelf Map", MapPin], ["Batches & Expiry", CalendarClock], ["Purchases", ShoppingCart], ["Suppliers", Truck]] },
    { title: "Smart Facility", items: [["Facility Center", Activity], ["Digital Twin", Server], ["Vision Queue", Camera], ["Maintenance", Wrench]] },
    { title: "Insights", items: [["Scenario Planning", GitMerge], ["AI Operations", BrainCircuit], ["Financial Intel", BarChart3], ["Predictive Risk", ShieldAlert], ["AI Insights", Sparkles], ["Quality Control", ThermometerSnowflake], ["Reports", FileText]] },
    { title: "System Ops", items: [["System Health", Activity], ["Error Center", AlertTriangle]] },
    { title: "Administration", items: [["Users & Roles", Users], ["Movements", ClipboardList], ["Settings", Settings]] }
  ];
  return <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
    <div className="side-top"><div className="brand-mark"><HeartPulse size={22}/></div><span className="brand-text">MediStock</span><button className="icon-btn side-toggle" onClick={()=>setCollapsed(!collapsed)}><Menu size={19}/></button></div>
    <div className="nav-scroll">
      {groups.map(g=><div className="nav-group" key={g.title}><span className="nav-title">{g.title}</span>{g.items.map(([name,Icon])=><button className={`nav-item ${active===name?"active":""}`} key={name} onClick={()=>setActive(name)}><Icon size={18}/><span>{name}</span>{name==="AI Insights"&&<i/>}</button>)}</div>)}
    </div>
    <div className="side-bottom"><button className="nav-item"><CircleHelp size={18}/><span>Help center</span></button><button className="nav-item logout" onClick={onLogout}><LogOut size={18}/><span>Sign out</span></button></div>
  </aside>;
}


function StatCard({ icon: Icon, label, value, change, detail, tone }) {
  return <div className="stat-card">
    <div className="stat-head"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className={change?.startsWith("+")?"positive":"negative"}>{change}</span></div>
    <div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div>
  </div>;
}

function MiniChart() {
  const points = [42,55,48,71,65,78,69,88,82,96,91,105];
  const max = 110;
  return <div className="chart-wrap">
    <div className="chart-grid">{[0,1,2,3].map(x=><span key={x}/>)}</div>
    <svg viewBox="0 0 600 190" preserveAspectRatio="none" className="chart-svg">
      <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity=".25"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs>
      <path d={`M 0 190 L ${points.map((p,i)=>`${i*(600/(points.length-1))} ${190-(p/max)*160}`).join(" L ")} L 600 190 Z`} fill="url(#fill)" />
      <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points.map((p,i)=>`${i*(600/(points.length-1))},${190-(p/max)*160}`).join(" ")}/>
    </svg>
    <div className="chart-labels">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(x=><span key={x}>{x}</span>)}</div>
  </div>;
}





function GenericPage({ title, eyebrow, icon: Icon, description, action, children }) {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action&&<button className="primary">{action}</button>}</div>{children||<section className="empty-feature panel"><div className="feature-icon"><Icon size={25}/></div><h2>{title} workspace</h2><p>This production-ready module is structured for API integration, role-based permissions, audit trails and real-time updates.</p><button className="secondary">Configure module <ChevronRight size={15}/></button></section>}</div>;
}

function AIInsights() {
  const [messages, setMessages] = useState([{role:"system", content:"Hello Admin. I'm your AI inventory assistant. Ask me anything about stock forecasting, financial intelligence, or generating purchase orders."}]);
  const [input, setInput] = useState("");
  
  const handleSend = () => {
    if(!input.trim()) return;
    
    let responseContent = "Analyzing current inventory metrics and seasonal trends... I have found 3 antibiotic batches expiring next month, and Paracetamol stock is below the optimal threshold for upcoming flu season. I have drafted a Purchase Order for your review.";
    let actionWidget = true;

    if (input.toLowerCase().includes("inventory value") || input.toLowerCase().includes("spend") || input.toLowerCase().includes("cost")) {
      responseContent = "I analyzed your financial metrics. The 2.4% increase in inventory value is driven by the recent bulk purchase of Amoxicillin (₹45,200) and Insulin Glargine (₹12,450). MedCore Labs remains your supplier with the largest spend this quarter.";
      actionWidget = false;
    }

    setMessages([...messages, {role:"user", content:input}, {role:"system", content:responseContent, actionWidget}]);
    setInput("");
  }
  return <div className="page ai-page">
    <div className="page-heading"><div><span className="eyebrow">INTELLIGENCE</span><h1>AI Inventory Assistant</h1><p>Natural language queries for your medical stock.</p></div></div>
    <div className="ai-chat-layout panel">
       <div className="chat-window">
          {messages.map((m,i)=><div key={i} className={`chat-bubble ${m.role}`}><div className="bubble-icon">{m.role==="system"?<Sparkles size={14}/>:<Users size={14}/>}</div><div style={{width:"100%"}}>{m.content}{m.actionWidget && <div className="panel po-card" style={{marginTop:15, background:"var(--surface)"}}><div className="po-head"><div className="po-title"><ShoppingCart size={14}/> <h3 style={{fontSize:13}}>Draft PO: Flu Restock</h3></div></div><div className="po-meta">Supplier: MedCore Labs • Est. Cost: ₹4,200</div><div className="po-actions"><button className="secondary">Review</button><button className="primary">Approve PO</button></div></div>}</div></div>)}
       </div>
       <div className="chat-input-row">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. Which antibiotics expire this month?" onKeyDown={e=>e.key==="Enter"&&handleSend()}/>
          <button className="primary" onClick={handleSend}><Send size={15}/> Ask</button>
       </div>
    </div>
  </div>;
}







function Modal({title,close,children}) { return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MEDISTOCK</span><h2>{title}</h2></div><button className="icon-btn" onClick={close}><X size={19}/></button></div>{children}</div></div> }

function UsersRoles() {
  const team = [
    { name: "Admin (You)", email: "admin@medistock.com", role: "Super Admin", access: "Full", status: "Active" },
    { name: "Dr. Sarah Chen", email: "schen@medistock.com", role: "Chief Pharmacist", access: "Read/Write", status: "Active" },
    { name: "Michael Vance", email: "mvance@medistock.com", role: "Inventory Clerk", access: "Restricted", status: "Offline" },
    { name: "Elena Rodriguez", email: "erodriguez@medistock.com", role: "Auditor", access: "Read-Only", status: "Active" },
  ];
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Users & Roles</h1><p>Manage staff accounts and permissions.</p></div><button className="primary"><Plus size={16}/> Invite user</button></div>
    <div className="panel" style={{padding:0, overflow:"hidden"}}>
      <div className="data-table">
        <div className="table-head" style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr"}}><span>User</span><span>Role</span><span>Access Level</span><span>Status</span><span>Actions</span></div>
        {team.map(u=>(
          <div className="data-row" key={u.email} style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr"}}>
            <div className="med-cell"><div className="avatar" style={{background:u.status==="Offline"?"#f1f5f9":""}}>{u.name.split(" ")[0][0]}{u.name.split(" ")[1][0]}</div><div><b>{u.name}</b><span>{u.email}</span></div></div>
            <span><b>{u.role}</b></span>
            <span>{u.access}</span>
            <span style={{color: u.status==="Active"?"var(--green)":"var(--muted)"}}>● {u.status}</span>
            <span><button className="link-btn">Edit</button></span>
          </div>
        ))}
      </div>
    </div>
  </div>;
}



function Reports() {
  const reports = [
    { title: "Monthly Stock Valuation", desc: "Current value of all inventory assets", type: "Financial", icon: BarChart3 },
    { title: "Expiry Risk Audit", desc: "Items expiring within 90 days", type: "Compliance", icon: Clock3 },
    { title: "Supplier Lead Times", desc: "Average fulfillment times per vendor", type: "Procurement", icon: Truck },
    { title: "Controlled Substances Log", desc: "Mandatory DEA/FDA tracking log", type: "Regulatory", icon: ShieldCheck },
  ];
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">REPORTING</span><h1>Reports</h1><p>Generate compliant and financial documents.</p></div><button className="primary"><Plus size={16}/> Custom Report</button></div>
    <div className="report-grid" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:15}}>
      {reports.map(r => (
        <div key={r.title} className="panel" style={{display:"flex", gap:15, alignItems:"center"}}>
           <div className="feature-icon" style={{margin:0, width:45, height:45}}><r.icon size={20}/></div>
           <div><b>{r.title}</b><p style={{margin:"2px 0 0", fontSize:11, color:"var(--muted)"}}>{r.desc}</p></div>
           <button className="secondary" style={{marginLeft:"auto"}}><Download size={14}/> Generate</button>
        </div>
      ))}
    </div>
  </div>;
}

function SettingsView() {
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">CONFIGURATION</span><h1>Settings</h1><p>Manage your workspace preferences.</p></div><button className="primary">Save Changes</button></div>
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

function CommandPalette({ open, setOpen, setActive }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if(!open) return null;

  const links = ["Today", "Dashboard", "Inventory", "Shelf Map", "Batches & Expiry", "Purchases", "Suppliers", "Analytics", "AI Insights", "Reports", "Users & Roles", "Movements", "Settings"];
  const filtered = links.filter(l => l.toLowerCase().includes(query.toLowerCase()));

  return <div className="modal-backdrop" onMouseDown={()=>setOpen(false)} style={{alignItems:"flex-start", paddingTop:"10vh"}}>
    <div className="modal command-modal" onMouseDown={e=>e.stopPropagation()} style={{padding:0, width:500}}>
       <div className="cmd-header"><Search size={16}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type a command or search..."/></div>
       <div className="cmd-list">
          {filtered.length===0 && <div className="empty-state">No results found</div>}
          {filtered.map(l => (
            <button key={l} className="cmd-item" onClick={()=>{setActive(l);setOpen(false)}}>
              <ChevronRight size={14}/> Go to {l} <span className="kbd">Jump</span>
            </button>
          ))}
       </div>
    </div>
  </div>;
}



function Analytics() {
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">INSIGHTS</span><h1>Analytics</h1><p>Inventory movement and financial intelligence.</p></div><div className="heading-actions"><button className="secondary"><Download size={16}/> Export Report</button><select className="secondary" style={{padding:"8px 12px", border:"1px solid var(--line)"}}><option>This Quarter</option><option>This Year</option></select></div></div>
    <div className="stat-grid" style={{marginBottom: 15}}>
      <StatCard icon={BarChart3} tone="blue" value="₹14.2L" label="Total Purchase Value" change="+12%" detail="vs. last quarter"/>
      <StatCard icon={Activity} tone="green" value="2.4%" label="Wastage Rate" change="-0.8%" detail="from expired stock"/>
      <StatCard icon={PackageSearch} tone="amber" value="4.2x" label="Inventory Turnover" change="+0.4x" detail="annualized"/>
      <StatCard icon={TrendingDown || ArrowDownRight} tone="rose" value="₹1.1L" label="Capital Tied Up" change="-5%" detail="in excess stock"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-head"><div><h3>Stock Burn Rate</h3><p>Consumption of top medicines over time</p></div></div><div style={{marginTop: 15}}><MiniChart /></div></section>
      <section className="panel"><div className="panel-head"><div><h3>Top Movers</h3><p>Highest volume items</p></div></div>
         <div className="table-list">
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Paracetamol 500mg</b><span>2,400 units dispensed</span></div></div>
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Amoxicillin 500mg</b><span>1,850 units dispensed</span></div></div>
            <div className="table-row"><div className="medicine-icon"><Activity size={16}/></div><div className="row-main"><b>Metformin 500mg</b><span>1,200 units dispensed</span></div></div>
         </div>
      </section>
    </div>
  </div>;
}

function Header({ active, theme, setTheme, onMenu, search, setSearch, setCmdOpen, setToast }) {
  return <header className="topbar">
    <div className="mobile-menu"><button className="icon-btn" onClick={onMenu}><Menu size={21}/></button></div>
    <div className="crumb"><span>Workspace</span><ChevronRight size={14}/><b>{active}</b></div>
    <div className="header-actions">
      <OrganizationSwitcher />
      <div className="header-search" onClick={()=>setCmdOpen(true)} style={{cursor:"text"}}><Search size={17}/><input readOnly placeholder="Search (Cmd+K)" style={{cursor:"text"}}/></div>
      <button className="icon-btn" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button>
      <button className="icon-btn notif" onClick={()=>setToast("No new notifications")}><Bell size={18}/><i/></button>
      <div className="avatar" style={{cursor:"pointer"}} onClick={()=>setToast("Profile settings")}>AP</div>
      <div className="user-mini" style={{cursor:"pointer"}} onClick={()=>setToast("Profile settings")}><b>Admin</b><span>Administrator</span></div>
    </div>
  </header>;
}

function App() {
  const [logged, setLogged] = useState(() => localStorage.getItem("medistock_logged") === "true");
  const [active, setActive] = useState(() => localStorage.getItem("medistock_active") || "Control Tower");
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("medistock_theme") || "light");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => { localStorage.setItem("medistock_logged", logged); }, [logged]);
  useEffect(() => { localStorage.setItem("medistock_active", active); }, [active]);
  useEffect(() => { 
    localStorage.setItem("medistock_theme", theme);
    document.documentElement.dataset.theme = theme; 
  }, [theme]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)}},[toast]);
  useEffect(()=>{
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  if(!logged) return <Login onLogin={()=>setLogged(true)}/>;
  
  const content = active==="Today" ? <Today setActive={setActive} setToast={setToast}/> :
    active==="Command Center" ? <CommandCenter setActive={setActive} setToast={setToast}/> :
    active==="Dashboard" ? <Dashboard setActive={setActive} setToast={setToast}/> :
    active==="Control Tower" ? <ControlTower setToast={setToast}/> :
    active==="Pharmacy Ops" ? <PharmacyOperations setToast={setToast}/> :
    active==="Inventory" ? <Inventory search={search} setToast={setToast}/> :
    active==="Batches & Expiry" ? <Batches setToast={setToast}/> :
    active==="Purchases" ? <Purchases setToast={setToast}/> :
    active==="Suppliers" ? <Suppliers setToast={setToast}/> :
    active==="Logistics Network" ? <LogisticsCommandCenter setActive={setActive} setToast={setToast}/> :
    active==="Logistics Ops" ? <LogisticsOperations setToast={setToast}/> :
    active==="Facility Center" ? <SmartFacilityCenter setActive={setActive} setToast={setToast}/> :
    active==="Digital Twin" ? <WarehouseDigitalTwin setToast={setToast}/> :
    active==="Vision Queue" ? <VisionReviewQueue setToast={setToast}/> :
    active==="Maintenance" ? <MaintenanceCenter setToast={setToast}/> :
    active==="System Health" ? <SystemHealth setToast={setToast}/> :
    active==="Error Center" ? <ErrorManagement setToast={setToast}/> :
    active==="Shelf Map" ? <ShelfMap setToast={setToast}/> :
    active==="Scenario Planning" ? <ScenarioPlanning setToast={setToast}/> :
    active==="AI Operations" ? <AIOperationsCenter setToast={setToast}/> :
    active==="Financial Intel" ? <FinancialIntelligence setToast={setToast}/> :
    active==="Predictive Risk" ? <PredictiveRisk setToast={setToast}/> :
    active==="Analytics" ? <Analytics setToast={setToast}/> :
    active==="AI Insights" ? <AIInsights setToast={setToast}/> :
    active==="Reports" ? <Reports setToast={setToast}/> :
    active==="Users & Roles" ? <UsersRoles setToast={setToast}/> :
    active==="Movements" ? <Movements setToast={setToast}/> :
    active==="Settings" ? <Administration setToast={setToast}/> :
    active==="Quality Control" ? <QualityControl setToast={setToast}/> :
    <div className="page fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', padding: '40px'}}>
      <div style={{background: 'var(--bg)', padding: '24px', borderRadius: '50%', marginBottom: '24px', color: 'var(--brand)'}}><Clock3 size={48} /></div>
      <h2 style={{fontSize: '24px', marginBottom: '12px'}}>Module Under Development</h2>
      <p style={{color: 'var(--muted)', maxWidth: '400px', lineHeight: 1.6}}>This enterprise feature is currently being finalized by the engineering team and will be available in the next release.</p>
    </div>;

  return <div className={`app-shell ${collapsed?"side-collapsed":""}`}>
    <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={()=>setLogged(false)}/>
    <main className="main">
      {!isOnline && <div style={{background: '#f43f5e', color: 'white', padding: '8px 16px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 500}}><AlertTriangle size={15}/> You are currently offline. MediStock is running in read-only mode.</div>}
      <Header active={active} theme={theme} setTheme={setTheme} onMenu={()=>setCollapsed(!collapsed)} search={search} setSearch={setSearch} setCmdOpen={setCmdOpen} setToast={setToast}/>
      {content}
    </main>
    {toast&&<div className="toast"><ShieldCheck size={17}/>{toast}</div>}
    <CommandPalette open={cmdOpen} setOpen={setCmdOpen} setActive={setActive}/>
  </div>;
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App/>
  </ErrorBoundary>
);