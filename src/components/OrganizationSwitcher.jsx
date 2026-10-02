import React, { useState } from 'react';
import { ChevronDown, Building, MapPin } from 'lucide-react';

export function OrganizationSwitcher() {
    const [open, setOpen] = useState(false);
    
    // Mocked for Phase 5 implementation
    const [currentOrg] = useState({ name: "Hospital Central", id: "org-1" });
    const [currentBranch, setCurrentBranch] = useState({ name: "Main Pharmacy", id: "br-1" });
    
    const branches = [
        { name: "Main Pharmacy", id: "br-1" },
        { name: "ICU Store", id: "br-2" },
        { name: "Emergency Store", id: "br-3" }
    ];

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 text-sm transition-colors"
            >
                <Building size={14} className="text-brand" />
                <div className="text-left leading-tight hidden sm:block">
                    <div className="text-xs text-slate-400 font-semibold">{currentOrg.name}</div>
                    <div className="text-white font-medium">{currentBranch.name}</div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            
            {open && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded shadow-xl z-50 py-2">
                    <div className="px-3 pb-2 mb-2 border-b border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Switch Workspace</span>
                    </div>
                    {branches.map(b => (
                        <button 
                            key={b.id}
                            onClick={() => { setCurrentBranch(b); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-800 ${currentBranch.id === b.id ? 'text-brand' : 'text-slate-300'}`}
                        >
                            <MapPin size={14} /> {b.name}
                        </button>
                    ))}
                    <div className="mt-2 pt-2 border-t border-slate-800 px-3">
                        <button className="text-xs text-slate-400 hover:text-white w-full text-left py-1">Manage Branches...</button>
                    </div>
                </div>
            )}
        </div>
    );
}
