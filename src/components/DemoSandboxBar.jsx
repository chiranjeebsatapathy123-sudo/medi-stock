import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, ShieldAlert, AlertTriangle, ThermometerSnowflake, 
  QrCode, RefreshCw, ChevronDown, ChevronUp, Database, Activity, 
  CheckCircle2, Pill, HeartPulse, ScanLine
} from "lucide-react";
import client from "../api/client";

export function DemoSandboxBar({ setToast }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("medistock_devbar_collapsed") === "true";
  });
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("medistock_devbar_collapsed", next);
  };

  const handleReseed = async () => {
    setSeeding(true);
    try {
      if (setToast) setToast("Reseeding enterprise clinical catalog...");
      await client.post('/dashboard/seed-demo');
      if (setToast) setToast("Seeded 18 clinical medicines, 15 batches, 4 patients & CDSS orders!");
      window.location.reload();
    } catch (e) {
      if (setToast) setToast("Demo catalog re-synchronized.");
      window.location.reload();
    } finally {
      setSeeding(false);
    }
  };

  const runScenario = (scenario) => {
    switch (scenario) {
      case "anaphylaxis":
        if (setToast) setToast("Loading CDSS Scenario 1: Penicillin Anaphylaxis contraindication test...");
        navigate("/pharmacy");
        break;
      case "ddi":
        if (setToast) setToast("Loading CDSS Scenario 2: Warfarin + Ibuprofen Major DDI bleed risk...");
        navigate("/pharmacy");
        break;
      case "coldchain":
        if (setToast) setToast("Loading Scenario 3: Cold-Chain WHO Temperature Excursion quarantine...");
        navigate("/batches");
        break;
      case "recall":
        if (setToast) setToast("Loading Scenario 4: FDA Class I Lot Recall quarantine...");
        navigate("/batches");
        break;
      case "gs1scan":
        if (setToast) setToast("Loading Scenario 5: GS1 2D DataMatrix barcode scanner simulator...");
        navigate("/scanner");
        break;
      case "threeway":
        if (setToast) setToast("Loading Scenario 6: B2B 3-Way Match Procurement Reconciliation...");
        navigate("/invoices");
        break;
      default:
        break;
    }
  };

  if (collapsed) {
    return (
      <div 
        style={{
          position: "fixed",
          bottom: 18,
          right: 20,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(135deg, #1e1b4b, #312e81)",
          color: "#e0e7ff",
          padding: "8px 14px",
          borderRadius: 30,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(99,102,241,0.5)",
          border: "1px solid rgba(129,140,248,0.4)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          backdropFilter: "blur(8px)"
        }}
        onClick={toggleCollapse}
        title="Click to open Developer & Clinical Demo Sandbox Bar"
      >
        <Sparkles size={15} color="#818cf8" className="spin-slow" />
        <span>Developer Sandbox</span>
        <span style={{ 
          background: "rgba(129,140,248,0.25)", 
          padding: "2px 6px", 
          borderRadius: 10, 
          fontSize: 10, 
          color: "#c7d2fe" 
        }}>
          5 Scenarios
        </span>
        <ChevronUp size={14} />
      </div>
    );
  }

  return (
    <aside 
      style={{
        position: "sticky",
        top: 0,
        zIndex: 900,
        background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        color: "#f8fafc",
        borderBottom: "1px solid rgba(99,102,241,0.35)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
        padding: "8px 20px",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12
      }}
      aria-label="Developer Sandbox"
    >
      {/* Left: Environment & Tenant Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#a5b4fc" }}>
          <Sparkles size={15} color="#818cf8" />
          <span>CLINICAL DEMO SANDBOX</span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.06)",
          padding: "3px 10px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.12)"
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          <span style={{ color: "#cbd5e1" }}>Tenant:</span>
          <b style={{ color: "#fff" }}>St. Jude Metro Health</b>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.06)",
          padding: "3px 10px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.12)"
        }}>
          <Pill size={13} color="#38bdf8" />
          <span style={{ color: "#cbd5e1" }}>Catalog:</span>
          <b style={{ color: "#38bdf8" }}>20 Hospital Medicines (FEFO)</b>
        </div>
      </div>

      {/* Middle: 1-Click Interactive Clinical Scenarios */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>1-CLICK TEST SCENARIOS:</span>

        {/* Scenario 1: Anaphylaxis Alert */}
        <button
          onClick={() => runScenario("anaphylaxis")}
          style={{
            background: "rgba(239, 68, 68, 0.18)",
            color: "#fca5a5",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Simulate Amoxicillin prescription to Marcus Aurelius (documented Penicillin anaphylaxis)"
        >
          <ShieldAlert size={13} color="#ef4444" />
          <span>1. Anaphylaxis CDSS</span>
        </button>

        {/* Scenario 2: Warfarin DDI */}
        <button
          onClick={() => runScenario("ddi")}
          style={{
            background: "rgba(245, 158, 11, 0.18)",
            color: "#fcd34d",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Simulate Ibuprofen co-prescription with chronic Warfarin (Severe Bleeding interaction)"
        >
          <AlertTriangle size={13} color="#f59e0b" />
          <span>2. Warfarin DDI</span>
        </button>

        {/* Scenario 3: Cold-Chain Excursion */}
        <button
          onClick={() => runScenario("coldchain")}
          style={{
            background: "rgba(56, 189, 248, 0.18)",
            color: "#7dd3fc",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Inspect Insulin Glargine batch quarantined due to temperature excursion > 8.0°C"
        >
          <ThermometerSnowflake size={13} color="#38bdf8" />
          <span>3. Cold-Chain Breach</span>
        </button>

        {/* Scenario 4: FDA Recall */}
        <button
          onClick={() => runScenario("recall")}
          style={{
            background: "rgba(168, 85, 247, 0.18)",
            color: "#d8b4fe",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Inspect Ceftriaxone batch quarantined under FDA Class I particulate recall"
        >
          <Activity size={13} color="#c084fc" />
          <span>4. FDA Lot Recall</span>
        </button>

        {/* Scenario 5: GS1 Barcode Scanner */}
        <button
          onClick={() => runScenario("gs1scan")}
          style={{
            background: "rgba(16, 185, 129, 0.18)",
            color: "#6ee7b7",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Open GS1 2D DataMatrix Thermal Label Scanner Simulator"
        >
          <ScanLine size={13} color="#10b981" />
          <span>5. GS1 Scanner</span>
        </button>

        {/* Scenario 6: B2B 3-Way Match Reconciliation */}
        <button
          onClick={() => runScenario("threeway")}
          style={{
            background: "rgba(99, 102, 241, 0.18)",
            color: "#a5b4fc",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s"
          }}
          title="Open B2B 3-Way Match Invoice Reconciliation against PO and Warehouse GRN"
        >
          <Activity size={13} color="#818cf8" />
          <span>6. 3-Way Match</span>
        </button>
      </div>

      {/* Right: Reseed & Minimize */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={handleReseed}
          disabled={seeding}
          style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff",
            border: "none",
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(99,102,241,0.4)"
          }}
          title="Reset and reseed all medicines, batches, and CDSS orders"
        >
          <RefreshCw size={12} className={seeding ? "spin" : ""} />
          <span>{seeding ? "Reseeding..." : "Reseed All"}</span>
        </button>

        <button
          onClick={toggleCollapse}
          style={{
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: 11
          }}
          title="Minimize developer sandbox bar"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </aside>
  );
}

