import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Clock3, ThermometerSnowflake, TrendingDown, RefreshCw } from 'lucide-react';
import apiClient from '../services/apiClient';

export function Today({ setActive }) {
    const [brief, setBrief] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch AI operational brief from backend (mocked fallback in UI for demonstration)
        setTimeout(() => {
            setBrief({
                critical: 2,
                attention: 7,
                expiring: 4,
                stockoutRisk: 3,
                purchasing: 5,
                coldChain: 1,
                summary: "You have 2 critical tasks today. Paracetamol stock is dangerously low, and there is an unacknowledged cold-chain alert in Storage Area B."
            });
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="page fade-in">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">DAILY OVERVIEW</span>
                    <h1>Today</h1>
                    <p>Your AI-assisted operational brief.</p>
                </div>
                <div className="heading-actions">
                    <button className="primary" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}>
                        <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" />
                    <p>Generating operational brief...</p>
                </div>
            ) : (
                <>
                    <section className="panel" style={{ marginBottom: 20, borderColor: 'var(--brand-glow)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.1)' }}>
                        <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 15 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Sparkles size={20} color="var(--brand)" />
                                <h3 style={{ margin: 0, color: 'var(--brand)' }}>AI Operational Brief</h3>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 0 10px 0' }}>
                            <img src="/3d_medical_orb.jpg" alt="AI Orb" className="animate-float3d" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand)' }} />
                            <div style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                                {brief.summary}
                            </div>
                        </div>
                    </section>

                    <div className="dashboard-grid">
                        <ActionCard icon={AlertTriangle} tone="rose" title="Critical Actions" value={brief.critical} desc="Requires immediate review" onClick={() => setActive("Inventory")} />
                        <ActionCard icon={TrendingDown} tone="amber" title="Stockout Risks" value={brief.stockoutRisk} desc="Depleting within lead time" onClick={() => setActive("Analytics")} />
                        <ActionCard icon={Clock3} tone="amber" title="Expiring Soon" value={brief.expiring} desc="Within 30 days" onClick={() => setActive("Batches & Expiry")} />
                        <ActionCard icon={ThermometerSnowflake} tone="blue" title="Cold Chain Alerts" value={brief.coldChain} desc="Temperature threshold breached" onClick={() => setActive("Shelf Map")} />
                    </div>
                </>
            )}
        </div>
    );
}

function ActionCard({ icon: Icon, tone, title, value, desc, onClick }) {
    return (
        <div className={`stat-card tilt-card cursor-pointer hover:bg-slate-800 transition-colors`} onClick={onClick}>
            <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
            <div className="stat-info">
                <h3>{title}</h3>
                <div className="stat-val">{value}</div>
                <div className="stat-meta">{desc}</div>
            </div>
        </div>
    );
}
