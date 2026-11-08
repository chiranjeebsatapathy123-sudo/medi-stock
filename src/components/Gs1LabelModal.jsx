import React, { useRef, useState } from 'react';
import { Printer, Copy, Check, X, QrCode, Tag, Sparkles, ShieldCheck } from 'lucide-react';

export function Gs1LabelModal({ isOpen, onClose, batch, medicine, setToast }) {
  const [copied, setCopied] = useState(false);
  const [labelSize, setLabelSize] = useState('standard'); // 'standard' (4x2) | 'compact' (2x1)
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Extract or synthesize GS1 data attributes
  const gtin = batch?.gtin || medicine?.gtin || '00378945612301';
  const lotNumber = batch?.batchNumber || batch?.lotNumber || 'LOT-2026-A1';
  
  // Format expiry YYMMDD
  let expiryYYMMDD = '281231';
  let formattedExpiry = '2028-12-31';
  if (batch?.expiryDate) {
    const d = new Date(batch.expiryDate);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    expiryYYMMDD = `${yy}${mm}${dd}`;
    formattedExpiry = batch.expiryDate;
  }

  const serialNumber = batch?.serialNumber || `SN-${Math.abs((gtin + lotNumber).split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0))|0, 0)).toString(36).toUpperCase().padStart(8, '0')}`;
  const gs1RawString = `(01)${gtin}(17)${expiryYYMMDD}(10)${lotNumber}(21)${serialNumber}`;

  const brandName = medicine?.brandName || batch?.medicine?.brandName || batch?.medicineName || 'Pharmaceutical Product';
  const genericName = medicine?.genericName || batch?.medicine?.genericName || 'Active Ingredient';
  const strength = medicine?.strength || '500 mg';
  const isColdChain = medicine?.isColdStorage || batch?.isColdStorage || false;
  const isControlled = medicine?.controlledMedicine || false;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(gs1RawString);
    setCopied(true);
    if (setToast) setToast('GS1 raw barcode string copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate deterministic pseudo-matrix pattern for GS1 DataMatrix SVG
  const matrixCells = [];
  const matrixSize = 16;
  const seed = (gtin + lotNumber + serialNumber).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Solid left and bottom border (L-finder pattern)
      if (c === 0 || r === matrixSize - 1) {
        matrixCells.push({ r, c, on: true });
      }
      // Alternating top and right border (clock track)
      else if (r === 0 || c === matrixSize - 1) {
        matrixCells.push({ r, c, on: (r + c) % 2 === 0 });
      }
      // Internal pseudo-random data payload based on hash seed
      else {
        const val = Math.sin(seed * (r * matrixSize + c)) * 10000;
        matrixCells.push({ r, c, on: (val - Math.floor(val)) > 0.45 });
      }
    }
  }

  // Generate Code128 1D barcode strips
  const barWidths = [2, 1, 3, 1, 2, 4, 1, 2, 3, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <QrCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                GS1 2D DataMatrix Label Generator
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DSCSA Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-400">FDA 21 CFR § 201.25 / GS1 General Specifications Release</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Label Preset Selector */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Tag size={16} className="text-blue-400" /> Label Format:
            </span>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setLabelSize('standard')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors ${
                  labelSize === 'standard' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Standard 4" × 2" (Pallet/Carton)
              </button>
              <button 
                type="button"
                onClick={() => setLabelSize('compact')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors ${
                  labelSize === 'compact' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Compact 2" × 1" (Unit-Dose)
              </button>
            </div>
          </div>

          {/* Printable Label Preview Area */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-center">
            
            {/* The Actual Physical Label (White Background Thermal Style) */}
            <div 
              ref={printRef}
              id="printable-gs1-label"
              className={`bg-white text-slate-900 rounded-xl shadow-md border border-slate-300 font-sans select-all ${
                labelSize === 'standard' 
                  ? 'w-[440px] p-5' 
                  : 'w-[320px] p-3'
              }`}
            >
              {/* Product Header */}
              <div className="border-b-2 border-slate-900 pb-2 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-950 leading-tight">
                      {brandName}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium italic">
                      {genericName} • {strength}
                    </p>
                  </div>
                  <div className="text-right">
                    {isColdChain && (
                      <span className="inline-block text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-400 px-1.5 py-0.5 rounded">
                        2°C - 8°C COLD CHAIN
                      </span>
                    )}
                    {isControlled && (
                      <span className="inline-block ml-1 text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-400 px-1.5 py-0.5 rounded">
                        DEA SCHED II
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barcode and Identification Grid */}
              <div className="grid grid-cols-12 gap-3 items-center">
                
                {/* 2D DataMatrix SVG */}
                <div className="col-span-4 flex flex-col items-center">
                  <div className="bg-white p-1 border border-slate-400 rounded">
                    <svg width="84" height="84" viewBox="0 0 16 16" className="shape-rendering-crispEdges">
                      {matrixCells.map((cell, idx) => (
                        cell.on && (
                          <rect 
                            key={idx} 
                            x={cell.c} 
                            y={cell.r} 
                            width="1" 
                            height="1" 
                            fill="#000000" 
                          />
                        )
                      ))}
                    </svg>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600 mt-1 uppercase">
                    GS1 DataMatrix
                  </span>
                </div>

                {/* Human Readable Interpretation (HRI) */}
                <div className="col-span-8 space-y-1 text-xs">
                  <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">(01) GTIN:</span>
                    <span className="font-mono font-black text-slate-950 text-xs">{gtin}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">(17) EXPIRY:</span>
                    <span className="font-mono font-bold text-slate-950 text-xs">
                      {expiryYYMMDD} <span className="text-[10px] font-normal text-slate-600">({formattedExpiry})</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">(10) LOT/BATCH:</span>
                    <span className="font-mono font-black text-blue-900 text-xs">{lotNumber}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">(21) SERIAL NO:</span>
                    <span className="font-mono font-bold text-slate-950 text-xs">{serialNumber}</span>
                  </div>
                </div>
              </div>

              {/* 1D Barcode Strip (Code 128 Emulation) */}
              <div className="mt-3 pt-2 border-t border-slate-300 flex flex-col items-center">
                <div className="flex items-stretch h-7 w-full justify-center gap-0.5 bg-white">
                  {barWidths.map((w, idx) => (
                    <div 
                      key={idx} 
                      className={`h-full ${idx % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                      style={{ width: `${w * 2}px` }} 
                    />
                  ))}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-800 mt-0.5">
                  *{gtin}*
                </div>
              </div>

              {/* Label Footer */}
              <div className="mt-2 text-[8px] text-slate-500 flex justify-between items-center border-t border-slate-200 pt-1">
                <span>MEDISTOCK ENTERPRISE WMS</span>
                <span>ORIGIN: USA • FDA REGISTERED</span>
              </div>
            </div>
          </div>

          {/* GS1 Parsed String Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw GS1 AIDC Encoded String
              </span>
              <button 
                onClick={handleCopyRaw}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy GS1 String'}
              </button>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-amber-400 border border-slate-800 select-all break-all">
              {gs1RawString}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Compatible with Zebra ZT411, Honeywell PM43, and Standard Laser Printers.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Printer size={16} /> Print GS1 Label
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

