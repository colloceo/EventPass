import React, { useState, useEffect, useRef } from 'react';
import { verifyTicket } from '../services/mockBackend';
import { VerificationResult } from '../types';
import { Scan, CheckCircle2, XCircle, RefreshCw, Search, ArrowRight, Smartphone, Zap } from 'lucide-react';

export const Scanner: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the hidden input for "USB Scanner gun" simulation
  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning, result]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    setIsScanning(false);
    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const verification = await verifyTicket(ticketId);
    setResult(verification);
    setTicketId('');
  };

  const resetScanner = () => {
    setResult(null);
    setIsScanning(true);
    setTicketId('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ticket Check-in</h2>
           <p className="text-slate-500 mt-1">Verify attendee tickets via QR Scan or Manual Entry.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            <Zap size={14} className="fill-current" /> Live System Ready
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Top Section: Viewfinder / Result */}
        <div className="bg-slate-950 relative h-[420px] flex flex-col items-center justify-center p-6 overflow-hidden">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {result ? (
              // --- Result State ---
              <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in duration-300">
                  <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${result.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-500'}`}>
                      {result.valid ? (
                          <CheckCircle2 className="w-16 h-16 drop-shadow-md" />
                      ) : (
                          <XCircle className="w-16 h-16 drop-shadow-md" />
                      )}
                  </div>
                  
                  <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {result.valid ? 'Access Granted' : 'Access Denied'}
                      </h3>
                      <p className={`text-lg font-medium ${result.valid ? 'text-emerald-200' : 'text-rose-200'}`}>
                        {result.message}
                      </p>
                  </div>

                  {result.ticket && (
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 text-left">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Event</p>
                                <p className="text-white font-semibold truncate max-w-[200px]">{result.ticket.eventName}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                    CHECKED IN
                                </span>
                             </div>
                          </div>
                          <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Attendee</p>
                                <p className="text-white text-lg font-semibold">{result.ticket.customerName}</p>
                          </div>
                      </div>
                  )}

                  <button
                    onClick={resetScanner}
                    className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
                  >
                    <RefreshCw size={20} /> Scan Next Ticket
                  </button>
              </div>
            ) : (
              // --- Scanning State ---
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                  
                  {/* Viewfinder Frame */}
                  <div className="relative w-64 h-64 md:w-72 md:h-72">
                      {/* Corners */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                      
                      {/* Scanning Animation */}
                      <div className="absolute inset-x-4 top-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-scan"></div>
                      
                      <div className="w-full h-full flex items-center justify-center">
                          <Scan className="text-slate-700/50 w-24 h-24" />
                      </div>
                  </div>

                  <div className="mt-8 text-center space-y-2">
                      <p className="text-white font-bold text-lg animate-pulse">Ready to Scan</p>
                      <p className="text-slate-400 text-sm">Point scanner at QR code</p>
                  </div>
              </div>
            )}
        </div>

        {/* Bottom Section: Manual Entry */}
        <div className="p-6 md:p-8 bg-white">
            <div className="max-w-md mx-auto">
                <form onSubmit={handleScan} className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Search size={20} />
                     </div>
                     <input 
                        ref={inputRef}
                        type="text"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        placeholder="Enter Ticket ID Manually"
                        className="block w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-mono text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:font-sans placeholder:text-slate-400"
                        autoFocus
                     />
                     <button 
                        type="submit"
                        disabled={!ticketId}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                     >
                        <ArrowRight size={20} />
                     </button>
                </form>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 py-2 rounded-lg border border-slate-100">
                    <Smartphone size={14} />
                    <span>Works with external USB scanners & mobile cameras</span>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};