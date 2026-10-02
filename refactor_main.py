import re

with open("src/main.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add react-router-dom imports
import_insert = 'import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";\n'
code = code.replace('import "./styles.css";', import_insert + 'import "./styles.css";')

# 2. Map of route paths
route_map = {
    "Today": "/today",
    "Command Center": "/command-center",
    "Dashboard": "/dashboard",
    "Control Tower": "/",
    "Pharmacy Ops": "/pharmacy-ops",
    "Inventory": "/inventory",
    "Batches & Expiry": "/batches",
    "Purchases": "/purchases",
    "Suppliers": "/suppliers",
    "Logistics Network": "/logistics-network",
    "Logistics Ops": "/logistics-ops",
    "Facility Center": "/facility-center",
    "Digital Twin": "/digital-twin",
    "Vision Queue": "/vision-queue",
    "Maintenance": "/maintenance",
    "System Health": "/system-health",
    "Error Center": "/error-center",
    "Shelf Map": "/shelf-map",
    "Scenario Planning": "/scenario-planning",
    "AI Operations": "/ai-operations",
    "Financial Intel": "/financial-intel",
    "Predictive Risk": "/predictive-risk",
    "Analytics": "/analytics",
    "AI Insights": "/ai-insights",
    "Reports": "/reports",
    "Users & Roles": "/users-roles",
    "Movements": "/movements",
    "Settings": "/settings",
    "Quality Control": "/quality-control"
}

# 3. Update Sidebar
sidebar_old = "function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {"
sidebar_new = """function Sidebar({ collapsed, setCollapsed, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const getActiveName = (path) => {
    const routeMap = {""" + ", ".join(f'"{v}": "{k}"' for k, v in route_map.items()) + """};
    return routeMap[path] || "Control Tower";
  };
  const active = getActiveName(activePath);
"""
code = code.replace(sidebar_old, sidebar_new)
code = code.replace('onClick={()=>setActive(name)}', 'onClick={()=>navigate({"Today":"/today","Command Center":"/command-center","Dashboard":"/dashboard","Control Tower":"/","Pharmacy Ops":"/pharmacy-ops","Inventory":"/inventory","Batches & Expiry":"/batches","Purchases":"/purchases","Suppliers":"/suppliers","Logistics Network":"/logistics-network","Logistics Ops":"/logistics-ops","Facility Center":"/facility-center","Digital Twin":"/digital-twin","Vision Queue":"/vision-queue","Maintenance":"/maintenance","System Health":"/system-health","Error Center":"/error-center","Shelf Map":"/shelf-map","Scenario Planning":"/scenario-planning","AI Operations":"/ai-operations","Financial Intel":"/financial-intel","Predictive Risk":"/predictive-risk","Analytics":"/analytics","AI Insights":"/ai-insights","Reports":"/reports","Users & Roles":"/users-roles","Movements":"/movements","Settings":"/settings","Quality Control":"/quality-control"}[name])}')

# 4. Update Header
header_old = "function Header({ active, theme, setTheme, onMenu, search, setSearch, setCmdOpen, setToast }) {"
header_new = """function Header({ theme, setTheme, onMenu, search, setSearch, setCmdOpen, setToast }) {
  const location = useLocation();
  const activePath = location.pathname;
  const getActiveName = (path) => {
    const routeMap = {""" + ", ".join(f'"{v}": "{k}"' for k, v in route_map.items()) + """};
    return routeMap[path] || "Control Tower";
  };
  const active = getActiveName(activePath);
"""
code = code.replace(header_old, header_new)

# 5. Update CommandPalette
cp_old = "function CommandPalette({ open, setOpen, setActive }) {"
cp_new = """function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
"""
code = code.replace(cp_old, cp_new)
code = code.replace('onClick={()=>{setActive(l);setOpen(false)}}', 'onClick={()=>{navigate({"Today":"/today","Command Center":"/command-center","Dashboard":"/dashboard","Control Tower":"/","Pharmacy Ops":"/pharmacy-ops","Inventory":"/inventory","Batches & Expiry":"/batches","Purchases":"/purchases","Suppliers":"/suppliers","Logistics Network":"/logistics-network","Logistics Ops":"/logistics-ops","Facility Center":"/facility-center","Digital Twin":"/digital-twin","Vision Queue":"/vision-queue","Maintenance":"/maintenance","System Health":"/system-health","Error Center":"/error-center","Shelf Map":"/shelf-map","Scenario Planning":"/scenario-planning","AI Operations":"/ai-operations","Financial Intel":"/financial-intel","Predictive Risk":"/predictive-risk","Analytics":"/analytics","AI Insights":"/ai-insights","Reports":"/reports","Users & Roles":"/users-roles","Movements":"/movements","Settings":"/settings","Quality Control":"/quality-control"}[l]);setOpen(false)}}')

# 6. Update App components rendering
app_old = """  const content = active==="Today" ? <Today setActive={setActive} setToast={setToast}/> :
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
    </div>;"""

app_new = """  const Fallback = () => (
    <div className="page fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', padding: '40px'}}>
      <div style={{background: 'var(--bg)', padding: '24px', borderRadius: '50%', marginBottom: '24px', color: 'var(--brand)'}}><Clock3 size={48} /></div>
      <h2 style={{fontSize: '24px', marginBottom: '12px'}}>Module Under Development</h2>
      <p style={{color: 'var(--muted)', maxWidth: '400px', lineHeight: 1.6}}>This enterprise feature is currently being finalized by the engineering team and will be available in the next release.</p>
    </div>
  );

  const content = (
    <Routes>
      <Route path="/" element={<ControlTower setToast={setToast}/>} />
      <Route path="/today" element={<Today setToast={setToast}/>} />
      <Route path="/command-center" element={<CommandCenter setToast={setToast}/>} />
      <Route path="/dashboard" element={<Dashboard setToast={setToast}/>} />
      <Route path="/pharmacy-ops" element={<PharmacyOperations setToast={setToast}/>} />
      <Route path="/inventory" element={<Inventory search={search} setToast={setToast}/>} />
      <Route path="/batches" element={<Batches setToast={setToast}/>} />
      <Route path="/purchases" element={<Purchases setToast={setToast}/>} />
      <Route path="/suppliers" element={<Suppliers setToast={setToast}/>} />
      <Route path="/logistics-network" element={<LogisticsCommandCenter setToast={setToast}/>} />
      <Route path="/logistics-ops" element={<LogisticsOperations setToast={setToast}/>} />
      <Route path="/facility-center" element={<SmartFacilityCenter setToast={setToast}/>} />
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
      <Route path="*" element={<Fallback />} />
    </Routes>
  );"""
code = code.replace(app_old, app_new)

# Remove active state logic in App
code = code.replace('const [active, setActive] = useState(() => localStorage.getItem("medistock_active") || "Control Tower");', '')
code = code.replace('useEffect(() => { localStorage.setItem("medistock_active", active); }, [active]);', '')

# Replace App render
code = code.replace('<Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={()=>setLogged(false)}/>', '<Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={()=>setLogged(false)}/>')
code = code.replace('<Header active={active} theme={theme} setTheme={setTheme} onMenu={()=>setCollapsed(!collapsed)} search={search} setSearch={setSearch} setCmdOpen={setCmdOpen} setToast={setToast}/>', '<Header theme={theme} setTheme={setTheme} onMenu={()=>setCollapsed(!collapsed)} search={search} setSearch={setSearch} setCmdOpen={setCmdOpen} setToast={setToast}/>')
code = code.replace('<CommandPalette open={cmdOpen} setOpen={setCmdOpen} setActive={setActive}/>', '<CommandPalette open={cmdOpen} setOpen={setCmdOpen}/>')

# Wrap App in BrowserRouter
code = code.replace('<App/>', '<BrowserRouter><App/></BrowserRouter>')

with open("src/main.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("main.jsx refactored for React Router")
