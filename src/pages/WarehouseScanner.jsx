import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Box, ArrowDownToLine, ArrowUpRight, CheckCircle2, AlertTriangle, ScanLine, X, Bot, ShieldAlert } from 'lucide-react';
import client from '../api/client';

export function WarehouseScanner({ setToast }) {
  const [activeTab, setActiveTab] = useState('menu'); // menu, scan, result
  const [mode, setMode] = useState(null); // put-away, pick, receive, info
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [visionAnalysis, setVisionAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  const startScan = (operationMode) => {
    setMode(operationMode);
    setActiveTab('scan');
    setScannedCode('');
    setError(null);
    setLocationInfo(null);
    setVisionAnalysis(null);
    setScanning(true);
    // Focus the hidden input to capture external scanner strokes, or user can type
    setTimeout(() => {
        if(inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const processScan = async (code) => {
    if(!code) return;
    setScanning(false);
    setLoading(true);
    setError(null);
    
    try {
      // First try to resolve as a location barcode
      const res = await client.post('/warehouse/scan-barcode', { barcode: code });
      setLocationInfo(res.data);
      setActiveTab('result');
    } catch(err) {
      setError("Unknown barcode or not found in system.");
      setActiveTab('result');
    } finally {
      setLoading(false);
    }
  };

  const runVisionAnalysis = async () => {
    setScanning(false);
    setLoading(true);
    setError(null);
    setVisionAnalysis(null);
    
    try {
      // Trigger backend to call ML Python service
      const res = await client.post('/facility/vision/trigger-simulation', { deviceId: 'mobile-scanner-01' });
      setVisionAnalysis(res.data);
      setActiveTab('result');
    } catch(err) {
      setError("Failed to run AI vision model.");
      setActiveTab('result');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processScan(scannedCode);
  };

  if (activeTab === 'menu') {
    return (
      <div className="mobile-warehouse-layout">
        <div className="mobile-header bg-slate-900 border-b border-slate-800 p-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><ScanLine className="text-amber-500"/> Warehouse Execution</h1>
          <p className="text-sm text-slate-400">Select operation to begin scanning</p>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-4">
          <button onClick={() => startScan('info')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors">
            <Search size={32} className="text-blue-400" />
            <span className="text-white font-medium">Location Info</span>
          </button>
          
          <button onClick={() => startScan('receive')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors">
            <ArrowDownToLine size={32} className="text-emerald-400" />
            <span className="text-white font-medium">Receive</span>
          </button>

          <button onClick={() => startScan('put-away')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors">
            <Box size={32} className="text-amber-400" />
            <span className="text-white font-medium">Put-Away</span>
          </button>

          <button onClick={() => startScan('pick')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors">
            <ArrowUpRight size={32} className="text-rose-400" />
            <span className="text-white font-medium">Pick Task</span>
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'scan') {
    return (
      <div className="mobile-warehouse-layout flex flex-col h-full bg-black">
        <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
           <h2 className="text-white font-medium capitalize">{mode} - Scanning</h2>
           <button onClick={() => setActiveTab('menu')} className="text-slate-400 hover:text-white"><X/></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative p-6">
           <div className="w-64 h-64 border-2 border-amber-500 rounded-3xl relative mb-8 flex items-center justify-center">
              <Camera size={48} className="text-slate-600 opacity-50" />
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
           </div>
           
           <form onSubmit={handleManualSubmit} className="w-full max-w-sm">
             <label className="text-sm text-slate-400 mb-2 block text-center">Or enter barcode manually</label>
             <div className="flex gap-2">
               <input 
                 ref={inputRef}
                 type="text" 
                 value={scannedCode} 
                 onChange={e => setScannedCode(e.target.value)} 
                 className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:border-amber-500 outline-none"
                 placeholder="0000000000"
                 autoFocus
               />
               <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 rounded-xl">Go</button>
             </div>
           </form>
           
           <div className="mt-12 w-full max-w-sm">
             <button onClick={runVisionAnalysis} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl py-4 font-bold flex justify-center items-center gap-2">
               <Bot className="text-blue-400" /> Analyze Shelf with AI Vision
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'result') {
    return (
      <div className="mobile-warehouse-layout h-full bg-slate-900">
        <div className="p-4 flex justify-between items-center border-b border-slate-800">
           <h2 className="text-white font-medium capitalize">Scan Result</h2>
           <button onClick={() => setActiveTab('menu')} className="text-slate-400 hover:text-white"><X/></button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center p-12 text-slate-400">Verifying...</div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
              <AlertTriangle size={48} className="text-rose-500 mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Scan Failed</h3>
              <p className="text-slate-300">{error}</p>
              <button onClick={() => setActiveTab('scan')} className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-lg font-medium">Try Again</button>
            </div>
          ) : visionAnalysis ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="bg-rose-500/10 p-6 flex flex-col items-center border-b border-slate-700/50">
                 <ShieldAlert size={48} className="text-rose-500 mb-2"/>
                 <h3 className="text-rose-400 font-bold">AI Anomaly Detected</h3>
                 <p className="text-white text-xl font-bold mt-2">{visionAnalysis.eventType?.replace('_', ' ')}</p>
              </div>
              <div className="p-4 space-y-3">
                 <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-sm">
                    <div className="text-slate-300 mb-1">Observation:</div>
                    <div className="text-white font-medium">{visionAnalysis.detection}</div>
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-sm mt-2">
                    <div className="text-slate-300 mb-1">Expected Standard:</div>
                    <div className="text-white font-medium">{visionAnalysis.expected}</div>
                 </div>
                 <div className="flex justify-between mt-4"><span className="text-slate-400">Confidence</span><span className="text-amber-400 font-bold">{(visionAnalysis.confidenceScore * 100).toFixed(1)}%</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Device ID</span><span className="text-white text-xs">{visionAnalysis.deviceId}</span></div>
              </div>
              <div className="p-4 pt-0 flex gap-2 mt-4">
                 <button onClick={() => setToast('Log created for review')} className="flex-1 bg-amber-500 text-slate-900 font-bold rounded-xl py-3">Flag for Review</button>
                 <button onClick={() => setActiveTab('scan')} className="flex-1 bg-slate-700 text-white font-bold rounded-xl py-3">Dismiss</button>
              </div>
            </div>
          ) : locationInfo ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="bg-emerald-500/10 p-6 flex flex-col items-center border-b border-slate-700/50">
                 <CheckCircle2 size={48} className="text-emerald-500 mb-2"/>
                 <h3 className="text-emerald-400 font-bold">Location Verified</h3>
                 <p className="text-white text-xl font-bold mt-2">{locationInfo.code}</p>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white">{locationInfo.name}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white">{locationInfo.locationType}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-400">{locationInfo.status}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Capacity</span><span className="text-white">{locationInfo.usedCapacity || 0} / {locationInfo.physicalCapacity || 'N/A'} {locationInfo.capacityUom}</span></div>
                 {locationInfo.temperatureProfile && <div className="flex justify-between"><span className="text-slate-400">Temp Profile</span><span className="text-blue-400">{locationInfo.temperatureProfile}</span></div>}
              </div>
              <div className="p-4 pt-0">
                 <button onClick={() => setToast('Mock Inventory Action')} className="w-full bg-amber-500 text-slate-900 font-bold rounded-xl py-3 mt-4">Confirm Location</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
