import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell,
  Boxes, CalendarClock, ChevronRight, CircleHelp, ClipboardList, Clock3,
  Download, FileText, Filter, HeartPulse, LayoutDashboard, LogOut,
  Menu, Moon, PackageSearch, Plus, RefreshCw, Search, Settings, ShieldCheck,
  ShoppingCart, Sparkles, Sun, Truck, Users, X, Zap, Map, Send, Play, MapPin, Undo2, TrendingDown, Camera, ShieldAlert, ThermometerSnowflake, BrainCircuit, Server, Wrench, GitMerge, Radio, ScanLine
} from "lucide-react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import client from "./api/client";
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
import { PharmacyWorkspace } from "./pages/PharmacyWorkspace";
import { IntelligenceCenter } from "./pages/IntelligenceCenter";
import { WarehouseScanner } from "./pages/WarehouseScanner";
import { Patients } from "./pages/Patients";
import { Invoices } from "./pages/Invoices";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";



function Sidebar({ collapsed, setCollapsed, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const getActiveName = (path) => {
    const routeMap = {"/intelligence": "Intelligence Center", "/today": "Today", "/command-center": "Command Center", "/dashboard": "Dashboard", "/": "Control Tower", "/pharmacy-ops": "Pharmacy Ops", "/pharmacy": "Pharmacy Workspace", "/inventory": "Inventory", "/batches": "Batches & Expiry", "/purchases": "Purchases", "/suppliers": "Suppliers", "/logistics-network": "Logistics Network", "/logistics-ops": "Logistics Ops", "/facility-center": "Facility Center", "/digital-twin": "Digital Twin", "/vision-queue": "Vision Queue", "/maintenance": "Maintenance", "/system-health": "System Health", "/error-center": "Error Center", "/shelf-map": "Shelf Map", "/scenario-planning": "Scenario Planning", "/ai-operations": "AI Operations", "/financial-intel": "Financial Intel", "/predictive-risk": "Predictive Risk", "/analytics": "Analytics", "/ai-insights": "AI Insights", "/reports": "Reports", "/users-roles": "Users & Roles", "/movements": "Movements", "/settings": "Settings", "/quality-control": "Quality Control", "/scanner": "Mobile Scanner"};
    return routeMap[path] || "Control Tower";
  };
  const active = getActiveName(activePath);

  const groups = [
    { title: "Core", items: [["Control Tower", Radio, "/"], ["Command Center", LayoutDashboard, "/command-center"], ["Intelligence Center", BrainCircuit, "/intelligence"]] },
    { title: "Inventory", items: [["Inventory", Boxes, "/inventory"], ["Batches & Expiry", CalendarClock, "/batches"], ["Movements", ClipboardList, "/movements"], ["Shelf Map", Map, "/shelf-map"], ["Mobile Scanner", ScanLine, "/scanner"]] },
    { title: "Procurement", items: [["Purchases", ShoppingCart, "/purchases"], ["Suppliers", Truck, "/suppliers"]] },
    { title: "Pharmacy & Billing", items: [["Pharmacy Workspace", HeartPulse, "/pharmacy"], ["Pharmacy Ops", HeartPulse, "/pharmacy-ops"], ["Patients", Users, "/patients"], ["Invoices", FileText, "/invoices"]] },
    { title: "Logistics", items: [["Facility Center", MapPin, "/facility-center"], ["Logistics Network", Truck, "/logistics-network"], ["Logistics Ops", Zap, "/logistics-ops"]] },
    { title: "Intelligence", items: [["Financial Intel", Activity, "/financial-intel"], ["Predictive Risk", AlertTriangle, "/predictive-risk"], ["AI Operations", Sparkles, "/ai-operations"], ["Digital Twin", Map, "/digital-twin"], ["Scenario Planning", BarChart3, "/scenario-planning"], ["Vision Queue", Camera, "/vision-queue"]] },
    { title: "Administration", items: [["Users & Roles", Users, "/users-roles"], ["Quality Control", ShieldCheck, "/quality-control"], ["System Health", Server, "/system-health"], ["Error Center", AlertTriangle, "/error-center"], ["Maintenance", Wrench, "/maintenance"], ["Settings", Settings, "/settings"]] }
  ];

  return <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
    <div className="side-top"><div className="brand-mark"><HeartPulse size={22}/></div><span className="brand-text">MediStock</span><button className="icon-btn side-toggle" onClick={()=>setCollapsed(!collapsed)}><Menu size={19}/></button></div>
    <div className="nav-scroll">
      {groups.map(g=><div className="nav-group" key={g.title}><span className="nav-title">{g.title}</span>{g.items.map(([name,Icon,path])=><button className={`nav-item ${active===name?"active":""}`} key={name} onClick={()=>navigate(path)}><Icon size={18}/><span>{name}</span></button>)}</div>)}
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
  const [messages, setMessages] = useState([{role:"system", content:"Hello Admin. I'm your Evidence-Based AI Assistant. Ask me anything about stockout risks, expiry exposures, or inventory health based on actual system data."}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSend = async () => {
    if(!input.trim() || loading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, {role:"user", content:userMsg}]);
    setInput("");
    setLoading(true);

    try {
      const res = await client.post('/intelligence/ask', { query: userMsg });
      const data = res.data;
      
      setMessages(prev => [...prev, {
        role:"system", 
        content: data.answer, 
        actionWidget: data.actionWidget,
        actionType: data.actionType,
        evidence: data.evidence
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {role:"system", content:"Sorry, I encountered an error checking the evidence database."}]);
    } finally {
      setLoading(false);
    }
  }

  return <div className="page ai-page">
    <div className="page-heading"><div><span className="eyebrow">INTELLIGENCE</span><h1>Ask MediStock</h1><p>Natural language queries backed by real operational data.</p></div></div>
    <div className="ai-chat-layout panel">
       <div className="chat-window">
          {messages.map((m,i)=><div key={i} className={`chat-bubble ${m.role}`}><div className="bubble-icon">{m.role==="system"?<BrainCircuit size={14}/>:<Users size={14}/>}</div><div style={{width:"100%"}}>{m.content}
          
          {m.actionWidget && m.evidence && (
            <div className="panel po-card" style={{marginTop:15, background:"var(--surface)"}}>
              <div className="po-head"><div className="po-title"><FileText size={14}/> <h3 style={{fontSize:13}}>Evidence Payload ({m.evidence.length || 0} records)</h3></div></div>
              <div className="po-meta" style={{maxHeight: '100px', overflow: 'auto', fontSize: 11}}>
                <pre>{JSON.stringify(m.evidence, null, 2)}</pre>
              </div>
              <div className="po-actions"><button className="secondary">Drill Down into Intelligence Center</button></div>
            </div>
          )}
          </div></div>)}
          {loading && <div className="chat-bubble system"><div className="bubble-icon"><RefreshCw className="spin" size={14}/></div><div>Querying operational evidence...</div></div>}
       </div>
       <div className="chat-input-row">
          <input value={input} onChange={e=>setInput(e.target.value)} disabled={loading} placeholder="e.g. Which antibiotics expire this month?" onKeyDown={e=>e.key==="Enter"&&handleSend()}/>
          <button className="primary" onClick={handleSend} disabled={loading}><Send size={15}/> Ask</button>
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

function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();

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

  const links = ["Intelligence Center", "Today", "Dashboard", "Inventory", "Shelf Map", "Batches & Expiry", "Purchases", "Suppliers", "Analytics", "AI Insights", "Reports", "Users & Roles", "Movements", "Settings"];
  const filtered = links.filter(l => l.toLowerCase().includes(query.toLowerCase()));

  return <div className="modal-backdrop" onMouseDown={()=>setOpen(false)} style={{alignItems:"flex-start", paddingTop:"10vh"}}>
    <div className="modal command-modal" onMouseDown={e=>e.stopPropagation()} style={{padding:0, width:500}}>
       <div className="cmd-header"><Search size={16}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type a command or search..."/></div>
       <div className="cmd-list">
          {filtered.length===0 && <div className="empty-state">No results found</div>}
          {filtered.map(l => (
            <button key={l} className="cmd-item" onClick={()=>{navigate({"Intelligence Center":"/intelligence","Today":"/today","Command Center":"/command-center","Dashboard":"/dashboard","Control Tower":"/","Pharmacy Workspace":"/pharmacy","Pharmacy Ops":"/pharmacy-ops","Inventory":"/inventory","Batches & Expiry":"/batches","Purchases":"/purchases","Suppliers":"/suppliers","Logistics Network":"/logistics-network","Logistics Ops":"/logistics-ops","Facility Center":"/facility-center","Digital Twin":"/digital-twin","Vision Queue":"/vision-queue","Maintenance":"/maintenance","System Health":"/system-health","Error Center":"/error-center","Shelf Map":"/shelf-map","Scenario Planning":"/scenario-planning","AI Operations":"/ai-operations","Financial Intel":"/financial-intel","Predictive Risk":"/predictive-risk","Analytics":"/analytics","AI Insights":"/ai-insights","Reports":"/reports","Users & Roles":"/users-roles","Movements":"/movements","Settings":"/settings","Quality Control":"/quality-control"}[l]);setOpen(false)}}>
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

function Header({ theme, setTheme, onMenu, search, setSearch, setCmdOpen, setToast }) {
  const location = useLocation();
  const activePath = location.pathname;
  const getActiveName = (path) => {
    const routeMap = {"/intelligence":"Intelligence Center", "/today": "Today", "/command-center": "Command Center", "/dashboard": "Dashboard", "/": "Control Tower", "/pharmacy": "Pharmacy Workspace", "/pharmacy-ops": "Pharmacy Ops", "/inventory": "Inventory", "/batches": "Batches & Expiry", "/purchases": "Purchases", "/suppliers": "Suppliers", "/logistics-network": "Logistics Network", "/logistics-ops": "Logistics Ops", "/facility-center": "Facility Center", "/digital-twin": "Digital Twin", "/vision-queue": "Vision Queue", "/maintenance": "Maintenance", "/system-health": "System Health", "/error-center": "Error Center", "/shelf-map": "Shelf Map", "/scenario-planning": "Scenario Planning", "/ai-operations": "AI Operations", "/financial-intel": "Financial Intel", "/predictive-risk": "Predictive Risk", "/analytics": "Analytics", "/ai-insights": "AI Insights", "/reports": "Reports", "/users-roles": "Users & Roles", "/movements": "Movements", "/settings": "Settings", "/quality-control": "Quality Control", "/scanner": "Mobile Scanner"};
    return routeMap[path] || "Control Tower";
  };
  const active = getActiveName(activePath);

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
  
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("medistock_theme") || "light");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => { localStorage.setItem("medistock_logged", logged); }, [logged]);
  
  useEffect(() => { 
    localStorage.setItem("medistock_theme", theme);
    document.documentElement.dataset.theme = theme; 
  }, [theme]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)}},[toast]);
  useEffect(()=>{
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleAuth = () => setLogged(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("auth:unauthorized", handleAuth);
    return () => { 
      window.removeEventListener("online", handleOnline); 
      window.removeEventListener("offline", handleOffline); 
      window.removeEventListener("auth:unauthorized", handleAuth);
    };
  }, []);

  if(!logged) return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setLogged={setLogged} />} />
      <Route path="/register" element={<Register setIsAuthenticated={setLogged} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
  
  const Fallback = () => (
    <div className="page fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', padding: '40px'}}>
      <div style={{background: 'var(--bg)', padding: '24px', borderRadius: '50%', marginBottom: '24px', color: 'var(--brand)'}}><Clock3 size={48} /></div>
      <h2 style={{fontSize: '24px', marginBottom: '12px'}}>Module Under Development</h2>
      <p style={{color: 'var(--muted)', maxWidth: '400px', lineHeight: 1.6}}>This enterprise feature is currently being finalized by the engineering team and will be available in the next release.</p>
    </div>
  );

  const content = (
    <Routes>
      <Route path="/" element={<ControlTower setToast={setToast}/>} />
      <Route path="/intelligence" element={<IntelligenceCenter setToast={setToast}/>} />
      <Route path="/today" element={<Today setToast={setToast}/>} />
      <Route path="/command-center" element={<CommandCenter setToast={setToast}/>} />
      <Route path="/dashboard" element={<Dashboard setToast={setToast}/>} />
      <Route path="/pharmacy" element={<PharmacyWorkspace setToast={setToast}/>} />
      <Route path="/pharmacy-ops" element={<PharmacyOperations setToast={setToast}/>} />
      <Route path="/inventory" element={<Inventory search={search} setToast={setToast}/>} />
      <Route path="/batches" element={<Batches setToast={setToast}/>} />
      <Route path="/purchases" element={<Purchases setToast={setToast}/>} />
      <Route path="/suppliers" element={<Suppliers setToast={setToast}/>} />
      <Route path="/logistics-network" element={<LogisticsCommandCenter setToast={setToast}/>} />
      <Route path="/logistics-ops" element={<LogisticsOperations setToast={setToast}/>} />
      <Route path="/facility-center" element={<SmartFacilityCenter setToast={setToast}/>} />
      <Route path="/scanner" element={<WarehouseScanner setToast={setToast}/>} />
      <Route path="/digital-twin" element={<WarehouseDigitalTwin setToast={setToast}/>} />
      <Route path="/vision-queue" element={<VisionReviewQueue setToast={setToast}/>} />
      <Route path="/maintenance" element={<MaintenanceCenter setToast={setToast}/>} />
      <Route path="/system-health" element={<SystemHealth setToast={setToast}/>} />
      <Route path="/error-center" element={<ErrorManagement setToast={setToast}/>} />
      <Route path="/shelf-map" element={<ShelfMap setToast={setToast}/>} />
      <Route path="/scenario-planning" element={<ScenarioPlanning setToast={setToast}/>} />
      <Route path="/ai-operations" element={<AIOperationsCenter setToast={setToast}/>} />
      <Route path="/financial-intel" element={<FinancialIntelligence setToast={setToast}/>} />
      <Route path="/predictive-risk" element={<PredictiveRisk setToast={setToast}/>} />
      <Route path="/analytics" element={<Analytics setToast={setToast}/>} />
      <Route path="/ai-insights" element={<AIInsights setToast={setToast}/>} />
      <Route path="/reports" element={typeof Reports !== 'undefined' ? <Reports setToast={setToast}/> : <Fallback />} />
      <Route path="/users-roles" element={typeof UsersRoles !== 'undefined' ? <UsersRoles setToast={setToast}/> : <Fallback />} />
      <Route path="/movements" element={<Movements setToast={setToast}/>} />
      <Route path="/settings" element={<Administration setToast={setToast}/>} />
      <Route path="/quality-control" element={<QualityControl setToast={setToast}/>} />
      <Route path="/patients" element={<Patients setToast={setToast}/>} />
      <Route path="/invoices" element={<Invoices setToast={setToast}/>} />
      <Route path="*" element={<Fallback />} />
    </Routes>
  );

  return <div className={`app-shell ${collapsed?"side-collapsed":""}`}>
    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={()=>{setLogged(false); localStorage.removeItem('medistock_token');}}/>
    <main className="main">
      {!isOnline && <div style={{background: '#f43f5e', color: 'white', padding: '8px 16px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 500}}><AlertTriangle size={15}/> You are currently offline. MediStock is running in read-only mode.</div>}
      <Header theme={theme} setTheme={setTheme} onMenu={()=>setCollapsed(!collapsed)} search={search} setSearch={setSearch} setCmdOpen={setCmdOpen} setToast={setToast}/>
      {content}
    </main>
    {toast&&<div className="toast"><ShieldCheck size={17}/>{toast}</div>}
    <CommandPalette open={cmdOpen} setOpen={setCmdOpen}/>
  </div>;
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <BrowserRouter><App/></BrowserRouter>
  </ErrorBoundary>
);