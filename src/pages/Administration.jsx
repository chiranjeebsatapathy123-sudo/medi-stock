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
                    {activeTab === 'Billing' && <BillingTab />}
                    {activeTab === 'Integrations' && <IntegrationsTab setToast={setToast} />}
                    {/* Other tabs would be implemented here */}
                    {activeTab !== 'Profile' && activeTab !== 'Billing' && activeTab !== 'Integrations' && (
                        <div className="empty-state mt-20">
                            <Settings size={32} className="text-slate-500 mb-3" />
                            <h3>{activeTab} configuration</h3>
                            <p>This module requires enterprise configuration mapping.</p>
                        </div>
                    )}
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
