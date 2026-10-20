import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Mic, MicOff, CornerDownLeft, Sparkles, Boxes, CalendarClock,
  ShoppingCart, Truck, HeartPulse, MapPin, Zap, ShieldAlert, Activity,
  FileText, Sun, Moon, Download, ScanLine, BrainCircuit, BarChart3,
  Clock, Check, X, AlertTriangle, Layers, ArrowUpRight, ArrowDownRight,
  Server, Wrench, ShieldCheck, Radio, RotateCcw, ChevronRight, Compass,
  SlidersHorizontal, CheckCircle2, RefreshCw
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';

export const CommandPalette = ({ open, setOpen, onClose, setToast, theme, setTheme }) => {
  const isPaletteOpen = open !== undefined ? open : true;
  const handleClose = () => {
    if (onClose) onClose();
    if (setOpen) setOpen(false);
  };

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [liveMedicines, setLiveMedicines] = useState([]);
  const [isSearchingData, setIsSearchingData] = useState(false);
  const [recentActions, setRecentActions] = useState(() => {
    try {
      const saved = localStorage.getItem('medistock_recent_cmd');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch quick inventory catalog for live search
  useEffect(() => {
    if (!isPaletteOpen) return;
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setIsSearchingData(true);
        const data = await inventoryService.getMedicines();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveMedicines(data);
        } else if (isMounted) {
          // Fallback demo medicines
          setLiveMedicines([
            { id: 'm1', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', totalStock: 840, status: 'IN_STOCK' },
            { id: 'm2', name: 'Paracetamol 650mg', genericName: 'Acetaminophen', category: 'Analgesic', totalStock: 12500, status: 'IN_STOCK' },
            { id: 'm3', name: 'Insulin Glargine 100IU/ml', genericName: 'Insulin Glargine', category: 'Cold-Chain Hormone', totalStock: 140, status: 'LOW_STOCK' },
            { id: 'm4', name: 'Amoxicillin + Clavulanate', genericName: 'Amoxicillin-Clav', category: 'Antibiotic', totalStock: 320, status: 'IN_STOCK' },
            { id: 'm5', name: 'Remdesivir 100mg Injection', genericName: 'Remdesivir', category: 'Antiviral', totalStock: 45, status: 'CRITICAL' },
            { id: 'm6', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', totalStock: 4200, status: 'IN_STOCK' },
            { id: 'm7', name: 'Meropenem 1g IV', genericName: 'Meropenem', category: 'Antibiotic', totalStock: 90, status: 'LOW_STOCK' },
            { id: 'm8', name: 'Metformin HCl 500mg', genericName: 'Metformin', category: 'Antidiabetic', totalStock: 8900, status: 'IN_STOCK' }
          ]);
        }
      } catch (err) {
        console.warn('CommandPalette live data fetch error, using fallbacks', err);
      } finally {
        if (isMounted) setIsSearchingData(false);
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, [isPaletteOpen]);

  // Keyboard shortcut listener (Cmd/Ctrl + K, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isPaletteOpen) handleClose();
        else if (setOpen) setOpen(true);
      }
      if (e.key === 'Escape' && isPaletteOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (isPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSpeechTranscript('');
    }
  }, [isPaletteOpen]);

  // Export Inventory CSV Action
  const handleExportInventoryCsv = async () => {
    try {
      const items = liveMedicines.length > 0 ? liveMedicines : await inventoryService.getMedicines();
      const headers = ['ID', 'Medicine Name', 'Generic Name', 'Category', 'Stock Units', 'Status'];
      const rows = (items || []).map(m => [
        `"${m.id || ''}"`,
        `"${m.name || m.brandName || ''}"`,
        `"${m.genericName || ''}"`,
        `"${m.category || ''}"`,
        m.totalStock ?? m.currentStock ?? 0,
        `"${m.status || 'ACTIVE'}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `medistock_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (setToast) setToast('Inventory CSV export generated successfully');
    } catch {
      if (setToast) setToast('Failed to export inventory CSV');
    }
  };

  // Run AI Anomaly Audit Simulation / Notification
  const handleRunAiAudit = () => {
    if (setToast) {
      setToast('AI Anomaly Audit initiated: Analyzing consumption spikes & price variance...');
    }
    navigate('/intelligence');
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    if (setTheme) {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      if (setToast) setToast(`Theme switched to ${nextTheme} mode`);
    }
  };

  // Categories definitions
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'actions', label: 'Quick Actions' },
    { id: 'ai', label: 'AI & Insights' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'warehouse', label: 'Warehouse & Logistics' },
    { id: 'settings', label: 'System & Tools' },
  ];

  // Base list of options and actions
  const systemOptions = useMemo(() => [
    // --- QUICK ACTIONS ---
    {
      id: 'act-receive',
      category: 'actions',
      label: 'Receive New Stock Inward',
      description: 'Log vendor deliveries, batch numbers, and verify cold chain',
      icon: ArrowDownRight,
      badge: 'Action',
      color: '#10b981',
      action: () => navigate('/movements')
    },
    {
      id: 'act-po',
      category: 'actions',
      label: 'Create Purchase Order (PO)',
      description: 'Draft automated or manual purchase requisition for suppliers',
      icon: ShoppingCart,
      badge: 'Procurement',
      color: '#0284c7',
      action: () => navigate('/purchases')
    },
    {
      id: 'act-dispatch',
      category: 'actions',
      label: 'Issue / Dispense Stock',
      description: 'Dispense medicines to internal departments, wards, or patient RX',
      icon: ArrowUpRight,
      badge: 'Action',
      color: '#f59e0b',
      action: () => navigate('/movements')
    },
    {
      id: 'act-transfer',
      category: 'actions',
      label: 'Internal Stock Transfer',
      description: 'Move stock between warehouse zones, bins, or sister hospital branches',
      icon: RotateCcw,
      badge: 'Action',
      color: '#8b5cf6',
      action: () => navigate('/movements')
    },
    {
      id: 'act-scanner',
      category: 'actions',
      label: 'Launch Barcode / QR Scanner',
      description: 'Activate device camera for barcode, 2D DataMatrix, or shelf scan',
      icon: ScanLine,
      badge: 'Scanner',
      color: '#ec4899',
      action: () => navigate('/scanner')
    },
    {
      id: 'act-export',
      category: 'actions',
      label: 'Export Inventory Snapshot (CSV)',
      description: 'Download real-time stock levels, generic names, and batch counts',
      icon: Download,
      badge: 'Export',
      color: '#06b6d4',
      action: handleExportInventoryCsv
    },

    // --- AI & PREDICTIVE INTELLIGENCE ---
    {
      id: 'ai-anomaly',
      category: 'ai',
      label: 'Run AI Anomaly Detection Audit',
      description: 'Scan consumption rates for sudden spikes, leakage, and vendor price jumps',
      icon: BrainCircuit,
      badge: 'AI Engine',
      color: '#6366f1',
      action: handleRunAiAudit
    },
    {
      id: 'ai-reorder',
      category: 'ai',
      label: 'Generate Smart Reorder Recommendations',
      description: 'Calculate lead-time demand, safety buffers, and optimal order quantities',
      icon: Sparkles,
      badge: 'AI Engine',
      color: '#38bdf8',
      action: () => navigate('/predictive-risk')
    },
    {
      id: 'ai-scenario',
      category: 'ai',
      label: 'Scenario Planning & Stockout Simulation',
      description: 'Simulate supply disruptions, epidemics, and delivery delays',
      icon: BarChart3,
      badge: 'AI Model',
      color: '#a855f7',
      action: () => navigate('/scenario-planning')
    },
    {
      id: 'ai-copilot',
      category: 'ai',
      label: 'Ask Evidence-Based AI Copilot',
      description: 'Query natural language inventory insights with audited database backing',
      icon: Sparkles,
      badge: 'Copilot',
      color: '#10b981',
      action: () => navigate('/intelligence')
    },
    {
      id: 'ai-vision',
      category: 'ai',
      label: 'Inspect AI Vision Review Queue',
      description: 'Review OCR-scanned drug labels and flagged discrepancies',
      icon: CameraCheckIcon,
      badge: 'Vision AI',
      color: '#f97316',
      action: () => navigate('/vision-queue')
    },

    // --- WAREHOUSE & LOGISTICS ---
    {
      id: 'wh-shelf-map',
      category: 'warehouse',
      label: 'Interactive Warehouse Shelf Map',
      description: 'Visual 2D/3D bin locations, rack capacity, and FEFO picking paths',
      icon: Layers,
      badge: 'Warehouse',
      color: '#3b82f6',
      action: () => navigate('/shelf-map')
    },
    {
      id: 'wh-twin',
      category: 'warehouse',
      label: 'Digital Twin & Facility Telemetry',
      description: 'Live sensor metrics, IoT humidity, and aisle congestion tracking',
      icon: Server,
      badge: 'IoT Twin',
      color: '#14b8a6',
      action: () => navigate('/digital-twin')
    },
    {
      id: 'wh-cold-chain',
      category: 'warehouse',
      label: 'Cold Chain & Smart Facility Center',
      description: 'Refrigerated medicine monitors (2°C - 8°C) and generator status',
      icon: ShieldAlert,
      badge: 'Cold Chain',
      color: '#0284c7',
      action: () => navigate('/facility-center')
    },
    {
      id: 'wh-logistics',
      category: 'warehouse',
      label: 'Logistics Fleet & Chain of Custody',
      description: 'GPS en-route medicine transports, courier temperature logs, and ETAs',
      icon: Truck,
      badge: 'Logistics',
      color: '#f59e0b',
      action: () => navigate('/logistics-network')
    },

    // --- NAVIGATION ---
    { id: 'nav-control', category: 'navigation', label: 'Control Tower', description: 'Enterprise-wide operational command center and alert feeds', icon: Radio, badge: 'Overview', color: '#38bdf8', action: () => navigate('/') },
    { id: 'nav-inv', category: 'navigation', label: 'Inventory Master Catalog', description: 'Search, filter, and edit formulations, SKUs, and stock thresholds', icon: Boxes, badge: 'Catalog', color: '#10b981', action: () => navigate('/inventory') },
    { id: 'nav-batches', category: 'navigation', label: 'Batches & Expiry Tracker', description: 'FEFO expiry warning timelines, lot numbers, and quarantine states', icon: CalendarClock, badge: 'Quality', color: '#f43f5e', action: () => navigate('/batches') },
    { id: 'nav-purchases', category: 'navigation', label: 'Procurement & Orders', description: 'Track vendor POs, invoice reconciliations, and arrival statuses', icon: ShoppingCart, badge: 'Purchases', color: '#0ea5e9', action: () => navigate('/purchases') },
    { id: 'nav-suppliers', category: 'navigation', label: 'Suppliers Directory', description: 'Vendor performance ratings, compliance certifications, and lead times', icon: Truck, badge: 'Vendors', color: '#8b5cf6', action: () => navigate('/suppliers') },
    { id: 'nav-pharmacy', category: 'navigation', label: 'Pharmacy Clinical Workspace', description: 'Prescription dispensing, patient validation, and stock deductions', icon: HeartPulse, badge: 'Clinical', color: '#ec4899', action: () => navigate('/pharmacy') },
    { id: 'nav-patients', category: 'navigation', label: 'Patient Directory & History', description: 'Patient records, dispensed prescriptions, and clinical allergies', icon: HeartPulse, badge: 'Patients', color: '#06b6d4', action: () => navigate('/patients') },
    { id: 'nav-invoices', category: 'navigation', label: 'Invoices & Billing', description: 'Patient invoices, insurance approvals, and payment statuses', icon: FileText, badge: 'Finance', color: '#10b981', action: () => navigate('/invoices') },
    { id: 'nav-financial', category: 'navigation', label: 'Financial Intelligence', description: 'COGS, stock holding costs, dead stock, and budget forecasts', icon: Activity, badge: 'Finance', color: '#f59e0b', action: () => navigate('/financial-intel') },
    { id: 'nav-qc', category: 'navigation', label: 'Quality Control & Compliance', description: 'Batch recall protocols, FDA/CDSCO audit logs, and drug testing', icon: ShieldCheck, badge: 'Compliance', color: '#10b981', action: () => navigate('/quality-control') },

    // --- SYSTEM & SETTINGS ---
    {
      id: 'sys-theme',
      category: 'settings',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle interface visual theme between light and dark',
      icon: theme === 'dark' ? Sun : Moon,
      badge: 'Theme',
      color: '#eab308',
      action: handleToggleTheme
    },
    {
      id: 'sys-health',
      category: 'settings',
      label: 'System Diagnostics & Health',
      description: 'PostgreSQL pool status, Redis caching, and ML API connectivity',
      icon: Server,
      badge: 'Diagnostics',
      color: '#3b82f6',
      action: () => navigate('/system-health')
    },
    {
      id: 'sys-errors',
      category: 'settings',
      label: 'Error Management Center',
      description: 'Audit runtime stack traces, failed webhooks, and retry queues',
      icon: AlertTriangle,
      badge: 'Logs',
      color: '#ef4444',
      action: () => navigate('/error-center')
    },
    {
      id: 'sys-users',
      category: 'settings',
      label: 'User Roles & Permissions (RBAC)',
      description: 'Manage clinical staff, pharmacists, warehouse crew, and security',
      icon: ShieldCheck,
      badge: 'Security',
      color: '#6366f1',
      action: () => navigate('/users-roles')
    },
    {
      id: 'sys-admin',
      category: 'settings',
      label: 'Hospital & System Settings',
      description: 'Configure tenant branches, notification rules, and API keys',
      icon: Wrench,
      badge: 'Config',
      color: '#64748b',
      action: () => navigate('/settings')
    }
  ], [theme, liveMedicines]);

  // Transform live medicines into searchable items
  const medicineOptions = useMemo(() => {
    return liveMedicines.map(m => ({
      id: `med-${m.id}`,
      category: 'navigation',
      label: m.name || m.brandName,
      description: `${m.genericName || ''} • Stock: ${m.totalStock ?? m.currentStock ?? 0} units • ${m.category || 'Pharmaceutical'}`,
      icon: Boxes,
      badge: m.status === 'CRITICAL' ? 'Critical' : m.status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock',
      color: m.status === 'CRITICAL' ? '#ef4444' : m.status === 'LOW_STOCK' ? '#f59e0b' : '#10b981',
      action: () => {
        navigate(`/inventory?search=${encodeURIComponent(m.name || m.genericName)}`);
      }
    }));
  }, [liveMedicines]);

  // Combine all items and filter by search and category
  const filteredItems = useMemo(() => {
    const combined = [...systemOptions, ...medicineOptions];
    return combined.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const matchLabel = item.label?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      return matchLabel || matchDesc || matchBadge;
    });
  }, [systemOptions, medicineOptions, selectedCategory, query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Execute selected item
  const executeItem = (item) => {
    if (!item) return;
    // Track in recent actions
    try {
      const updated = [
        { id: item.id, label: item.label, category: item.category },
        ...recentActions.filter(r => r.id !== item.id)
      ].slice(0, 5);
      setRecentActions(updated);
      localStorage.setItem('medistock_recent_cmd', JSON.stringify(updated));
    } catch {
      // ignore localStorage error
    }

    handleClose();
    if (typeof item.action === 'function') {
      item.action();
    }
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const catKeys = categories.map(c => c.id);
      const currentIdx = catKeys.indexOf(selectedCategory);
      const nextIdx = e.shiftKey
        ? (currentIdx > 0 ? currentIdx - 1 : catKeys.length - 1)
        : (currentIdx < catKeys.length - 1 ? currentIdx + 1 : 0);
      setSelectedCategory(catKeys[nextIdx]);
    }
  };

  // Voice Assistant
  const toggleVoiceAssistant = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechTranscript('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setSpeechTranscript(transcript);
      setQuery(transcript);

      // Check if command recognized
      if (event.results[0].isFinal) {
        const lower = transcript.toLowerCase();
        if (lower.includes('dark mode') || lower.includes('night mode')) {
          setTheme?.('dark');
          handleClose();
        } else if (lower.includes('light mode') || lower.includes('day mode')) {
          setTheme?.('light');
          handleClose();
        } else if (lower.includes('inventory')) {
          navigate('/inventory');
          handleClose();
        } else if (lower.includes('batch') || lower.includes('expiry')) {
          navigate('/batches');
          handleClose();
        } else if (lower.includes('purchase') || lower.includes('order')) {
          navigate('/purchases');
          handleClose();
        } else if (lower.includes('scanner') || lower.includes('scan')) {
          navigate('/scanner');
          handleClose();
        } else if (lower.includes('supplier')) {
          navigate('/suppliers');
          handleClose();
        } else if (lower.includes('export')) {
          handleExportInventoryCsv();
          handleClose();
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpeechTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isPaletteOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onMouseDown={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.7)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '8vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <div 
        className="cmd-palette-box"
        onMouseDown={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          border: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(56, 189, 248, 0.15)',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82vh',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a'
        }}
      >
        {/* Top Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.6)' : '1px solid rgba(226, 232, 240, 0.8)',
          gap: '12px',
          background: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.6)'
        }}>
          <Search size={20} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening for command..." : "Search medicines, batches, POs, or type a command... (Press Tab to cycle)"}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'inherit',
              fontWeight: 500
            }}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Voice Assistant Mic Button */}
          <button
            onClick={toggleVoiceAssistant}
            title={isListening ? "Click to stop listening" : "Voice Command (Speak to navigate)"}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: isListening ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.2)',
              background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)',
              color: isListening ? '#ef4444' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            {isListening ? <Mic size={15} className="animate-pulse" /> : <MicOff size={15} />}
            <span>{isListening ? 'Listening' : 'Voice'}</span>
          </button>

          {/* ESC badge */}
          <button 
            onClick={handleClose}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)',
              color: '#94a3b8',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ESC
          </button>
        </div>

        {/* Voice Listening Active Alert Banner */}
        {isListening && (
          <div style={{
            padding: '10px 20px',
            background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(99,102,241,0.15))',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#ef4444',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span>Voice Mode: Speak "Open inventory", "Dark mode", "Export report", or medicine name...</span>
            </div>
            {speechTranscript && <span style={{ color: '#38bdf8', fontStyle: 'italic' }}>"{speechTranscript}"</span>}
          </div>
        )}

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 18px',
          borderBottom: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.4)' : '1px solid rgba(226, 232, 240, 0.6)',
          overflowX: 'auto',
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.4)'
        }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive 
                    ? '1px solid #38bdf8' 
                    : theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
                  background: isActive 
                    ? 'rgba(56, 189, 248, 0.15)' 
                    : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          style={{
            overflowY: 'auto',
            maxHeight: '440px',
            padding: '8px 12px'
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: '#f59e0b' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'inherit' }}>
                No commands or items found for "{query}"
              </div>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Try searching for "Paracetamol", "PO", "Transfer", "Audit", or switch categories.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = item.icon || ChevronRight;
              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    transition: 'all 0.12s ease',
                    background: isSelected 
                      ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.08)')
                      : 'transparent',
                    border: isSelected 
                      ? '1px solid rgba(56, 189, 248, 0.35)' 
                      : '1px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${item.color || '#38bdf8'}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color || '#38bdf8',
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isSelected ? '#38bdf8' : 'inherit'
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: `${item.color || '#38bdf8'}22`,
                            color: item.color || '#38bdf8',
                            flexShrink: 0
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isSelected && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.12)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Select <CornerDownLeft size={11} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div style={{
          padding: '10px 18px',
          borderTop: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
          background: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span><kbd style={{ background: 'rgba(100,116,139,0.2)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ background: 'rgba(100,116,139,0.2)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>↵</kbd> Open</span>
            <span><kbd style={{ background: 'rgba(100,116,139,0.2)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>Tab</kbd> Switch category</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span>{filteredItems.length} options ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper camera icon
function CameraCheckIcon(props) {
  return <ScanLine {...props} />;
}

export default CommandPalette;
