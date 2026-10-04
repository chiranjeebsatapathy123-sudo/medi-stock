import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Mic, MicOff } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else document.dispatchEvent(new CustomEvent('open-command-palette'));
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 2) {
            const simulatedResults = [
                { type: 'Medicines', label: 'Aspirin 500mg', path: '/inventory' },
                { type: 'Actions', label: 'Receive New Stock', path: '/movements' },
                { type: 'Orders', label: 'PO-2026-001', path: '/purchases' },
                { type: 'Suppliers', label: 'PharmaCorp Inc.', path: '/suppliers' }
            ].filter(r => r.label.toLowerCase().includes(q.toLowerCase()));
            setResults(simulatedResults);
        } else {
            setResults([]);
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setQuery(transcript);
            
            // Auto-trigger search for final result
            if (event.results[0].isFinal) {
                handleSearch({ target: { value: transcript } });
            }
        };
        
        recognition.start();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black bg-opacity-50">
            <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700">
                <div className="flex items-center px-4 py-3 border-b border-slate-800">
                    <span className="text-slate-400 mr-3">🔍</span>
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={handleSearch}
                        placeholder={isListening ? "Listening..." : "Search medicines, batches, orders, or type a command..."}
                        className="flex-1 bg-transparent border-none text-white focus:outline-none"
                    />
                    <button 
                        onClick={startListening} 
                        className={`mr-3 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                        {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 bg-slate-800 rounded">ESC</button>
                </div>
                {results.length > 0 && (
                    <div className="max-h-96 overflow-y-auto py-2">
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                onClick={() => { navigate(result.path); onClose(); }}
                                className="px-4 py-2 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-sm"
                            >
                                <span className="text-white">{result.label}</span>
                                <span className="text-xs text-slate-500 uppercase">{result.type}</span>
                            </div>
                        ))}
                    </div>
                )}
                {query.length > 2 && results.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">
                        No results found for "{query}"
                    </div>
                )}
                {query.length <= 2 && (
                    <div className="p-4 text-slate-500 text-xs">
                        <p className="mb-2 uppercase text-[10px] tracking-wider font-semibold">Suggested Commands</p>
                        <div className="flex gap-2 mb-4">
                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700">Receive Stock</span>
                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700">New Purchase Order</span>
                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700">Transfer Stock</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandPalette;
