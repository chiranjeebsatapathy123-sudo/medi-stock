import React, { useState } from 'react';
import { Settings, Users, CreditCard, Shield, Webhook, Box, Bell, Network, CheckCircle2, AlertTriangle, RefreshCw, XCircle, MoreVertical } from 'lucide-react';

export function Administration({ setToast }) {
    const [activeTab, setActiveTab] = useState('Profile');
    
    const tabs = [
        { name: 'Profile', icon: Box },
        { name: 'Users & Roles', icon: Users },
        { name: 'Billing', icon: CreditCard },
        { name: 'Security', icon: Shield },
        { name: 'Integrations', icon: Network },
        { name: 'Webhooks', icon: Webhook }
    ];

    return (
        <div className="page fade-in">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">ORGANIZATION SETTINGS</span>
                    <h1>Administration</h1>
                    <p>Manage your enterprise workspace, users, and billing.</p>
                </div>
            </div>

            <div className="flex gap-6 mt-6">
                <div className="w-48 shrink-0 flex flex-col gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                                activeTab === tab.name 
                                ? 'bg-brand/10 text-brand font-medium' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[500px]">
                    {activeTab === 'Profile' && <ProfileTab />}
                    {activeTab === 'Users & Roles' && <UsersTab setToast={setToast} />}
                    {activeTab === 'Billing' && <BillingTab />}
                    {activeTab === 'Security' && <SecurityTab setToast={setToast} />}
                    {activeTab === 'Integrations' && <IntegrationsTab setToast={setToast} />}
                    {activeTab === 'Webhooks' && <WebhooksTab setToast={setToast} />}
                </div>
            </div>
        </div>
    );
}

function ProfileTab() {
    return (
        <div className="max-w-2xl">
            <h2 className="text-xl text-white font-medium mb-6">Organization Profile</h2>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Organization Name</label>
                        <input type="text" defaultValue="Hospital Central" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Organization Code</label>
                        <input type="text" defaultValue="HOSP-CEN-01" disabled className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Primary Address</label>
                    <textarea rows="3" defaultValue="123 Medical Parkway&#10;Metropolis, NY 10001" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Timezone</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white">
                            <option>UTC-05:00 (Eastern Time)</option>
                            <option>UTC+00:00 (GMT)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Currency</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white">
                            <option>USD ($)</option>
                            <option>INR (₹)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <button className="primary px-4 py-2">Save Changes</button>
                </div>
            </div>
        </div>
    );
}

function BillingTab() {
    return (
        <div>
            <h2 className="text-xl text-white font-medium mb-6">Subscription & Billing</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</div>
                    <div className="text-2xl font-bold text-white mb-1">Professional</div>
                    <div className="text-sm text-brand font-medium">Active</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Renewal Date</div>
                    <div className="text-2xl font-bold text-white mb-1">Nov 15, 2026</div>
                    <div className="text-sm text-slate-400">$299.00 / month</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Payment Method</div>
                    <div className="text-2xl font-bold text-white mb-1">•••• 4242</div>
                    <div className="text-sm text-slate-400">Expires 12/28</div>
                </div>
            </div>

            <h3 className="text-lg text-white font-medium mb-4">Usage Metering</h3>
            <div className="flex flex-col gap-4">
                <UsageBar label="Active Users" used={12} limit={25} />
                <UsageBar label="AI Copilot Requests" used={840} limit={1000} />
                <UsageBar label="Storage" used={450} limit={5000} unit="MB" />
            </div>
        </div>
    );
}

function UsageBar({ label, used, limit, unit = "" }) {
    const percent = Math.min(100, Math.round((used / limit) * 100));
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="text-slate-400">{used}{unit} / {limit}{unit}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-brand'}`} 
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function IntegrationsTab({ setToast }) {
    const integrations = [
        { id: 1, provider: 'Epic Systems', category: 'ERP / Pharmacy', status: 'Healthy', lastSync: '2 mins ago', errors: 0 },
        { id: 2, provider: 'AmerisourceBergen', category: 'Suppliers', status: 'Healthy', lastSync: '1 hr ago', errors: 0 },
        { id: 3, provider: 'SendGrid', category: 'Email', status: 'Healthy', lastSync: '12 mins ago', errors: 0 },
        { id: 4, provider: 'Twilio', category: 'SMS', status: 'Error', lastSync: 'Failed', errors: 3 },
        { id: 5, provider: 'Google Vertex AI', category: 'AI', status: 'Healthy', lastSync: '1 min ago', errors: 0 },
        { id: 6, provider: 'SenseAnywhere', category: 'IoT', status: 'Needs Config', lastSync: 'Never', errors: 0 }
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white">Integration Hub</h2>
                    <p className="text-sm text-slate-400">Manage external ecosystem connections and webhooks.</p>
                </div>
                <button className="primary text-sm px-3 py-1.5" onClick={() => setToast('Opening Integration Catalog...')}>Browse Directory</button>
            </div>

            <div className="flex flex-col gap-4">
                {integrations.map(int => (
                    <div key={int.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                int.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-500' :
                                int.status === 'Error' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-slate-500/10 text-slate-400'
                            }`}>
                                {int.status === 'Healthy' ? <CheckCircle2 size={20} /> :
                                 int.status === 'Error' ? <XCircle size={20} /> :
                                 <AlertTriangle size={20} />}
                            </div>
                            <div>
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    {int.provider}
                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                        {int.category}
                                    </span>
                                </h4>
                                <div className="text-sm text-slate-400 flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1">
                                        <RefreshCw size={12} /> Last sync: {int.lastSync}
                                    </span>
                                    {int.errors > 0 && (
                                        <span className="text-rose-400 text-xs">
                                            {int.errors} recent failures
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {int.status !== 'Needs Config' && (
                                <button className="secondary px-3 py-1.5 text-xs" onClick={() => setToast(`Syncing with ${int.provider}...`)}>Sync Now</button>
                            )}
                            <button className="icon-btn" onClick={() => setToast(`Opening configuration for ${int.provider}`)}><Settings size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersTab({ setToast }) {
    const staff = [
        { name: "Dr. Sarah Chen, MD", email: "admin@medistock.com", role: "SUPER_ADMIN", badge: "Super Admin", mfa: true, lastLogin: "Active now" },
        { name: "Marcus Aurelius, PharmD", email: "pharmacist@medistock.com", role: "PHARMACIST", badge: "Lead Pharmacist", mfa: true, lastLogin: "5 mins ago" },
        { name: "Elena Rostova, RN", email: "nurse@medistock.com", role: "CLINICAL_NURSE", badge: "Clinical Nurse", mfa: false, lastLogin: "2 hrs ago" },
        { name: "James Vance", email: "logistics@medistock.com", role: "LOGISTICS_DISPATCH", badge: "Logistics Manager", mfa: true, lastLogin: "Yesterday" }
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white">Clinical Staff & Access Control</h2>
                    <p className="text-sm text-slate-400">Manage clinical roles, MFA enforcement, and hospital branch authorizations.</p>
                </div>
                <button className="primary text-sm px-3 py-1.5" onClick={() => setToast && setToast("Sending clinical invite...")}>Invite Member</button>
            </div>

            <div className="flex flex-col gap-3">
                {staff.map((u, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand">
                                {u.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    {u.name}
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand/20 text-brand">
                                        {u.badge}
                                    </span>
                                </h4>
                                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                                    <span>{u.email}</span>
                                    <span>•</span>
                                    <span style={{ color: u.mfa ? '#10b981' : '#f59e0b' }}>
                                        {u.mfa ? "✓ MFA Enforced" : "⚠️ MFA Optional"}
                                    </span>
                                    <span>•</span>
                                    <span>{u.lastLogin}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="secondary px-3 py-1 text-xs" onClick={() => setToast && setToast(`Access policy viewed for ${u.name}`)}>Edit Role</button>
                            <button className="secondary px-3 py-1 text-xs" onClick={() => setToast && setToast(`Reset link sent to ${u.email}`)}>Reset Pass</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SecurityTab({ setToast }) {
    return (
        <div className="animate-fade-in max-w-2xl">
            <h2 className="text-xl text-white font-medium mb-2">FDA 21 CFR Part 11 & DEA Security Protocol</h2>
            <p className="text-sm text-slate-400 mb-6">Enforce electronic signature validation, session protection, and narcotic dual control.</p>

            <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                        <b className="text-white text-sm block">Cryptographic SHA-256 Audit Trail</b>
                        <span className="text-xs text-slate-400">All dispensing, receipts, and recalls chained cryptographically.</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">ACTIVE</span>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                        <b className="text-white text-sm block">Mandatory CDSS Override Justification</b>
                        <span className="text-xs text-slate-400">Blocks contraindicated drug dispensing unless justification is signed.</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">ENFORCED</span>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                        <b className="text-white text-sm block">DEA Schedule II Dual-Authorization</b>
                        <span className="text-xs text-slate-400">Requires co-signature for Morphine and Fentanyl dispensing.</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">ENFORCED</span>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                        <b className="text-white text-sm block">Session Idle Timeout</b>
                        <span className="text-xs text-slate-400">Automatically logs out inactive terminals after 15 minutes.</span>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">15 MIN</span>
                </div>

                <button className="primary px-4 py-2 mt-2 w-fit" onClick={() => setToast && setToast("Security policy synchronized across all hospital terminals.")}>
                    Update Security Policy
                </button>
            </div>
        </div>
    );
}

function WebhooksTab({ setToast }) {
    const hooks = [
        { event: "prescription.dispensed", endpoint: "https://ehr.metro-health.org/api/v2/dispense", active: true },
        { event: "batch.quarantined", endpoint: "https://safety.metro-health.org/hooks/quarantine", active: true },
        { event: "recall.executed", endpoint: "https://fda-gateway.healthmail.com/webhook", active: true },
        { event: "coldchain.excursion", endpoint: "https://facility-iot.metro-health.org/alerts", active: true }
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white">Outbound Webhooks</h2>
                    <p className="text-sm text-slate-400">Real-time JSON event streams dispatched to hospital EHR and regulatory endpoints.</p>
                </div>
                <button className="primary text-sm px-3 py-1.5" onClick={() => setToast && setToast("Configuring new webhook...")}>Add Webhook</button>
            </div>

            <div className="flex flex-col gap-3">
                {hooks.map((h, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-brand uppercase font-mono">{h.event}</span>
                            <div className="text-xs text-slate-400 font-mono mt-1">{h.endpoint}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                            <button className="secondary px-3 py-1 text-xs" onClick={() => setToast && setToast(`Test payload sent to ${h.event}`)}>Test Ping</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
