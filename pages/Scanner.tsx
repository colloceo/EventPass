import React, { useState, useEffect, useRef } from 'react';
import { verifyTicket } from '../services/mockBackend';
import { VerificationResult } from '../types';
import { Scan, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

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
    <div className="max-w-xl mx-auto">
        <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Ticket Check-in</h2>
        <p className="text-slate-500">Scan QR code or enter ID manually.</p>
      </header>

      {/* Scanner Box */}
      <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        
        {result ? (
          // Result View
          <div className="text-center animate-in fade-in zoom-in duration-300">
            {result.valid ? (
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            )}
            
            <h3 className={`text-3xl font-bold mb-2 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
              {result.valid ? 'Access Granted' : 'Access Denied'}
            </h3>
            <p className="text-slate-300 text-lg mb-6">{result.message}</p>
            
            {result.ticket && (
              <div className="bg-slate-800 p-4 rounded-lg text-left w-full max-w-xs mx-auto mb-6">
                 <p className="text-slate-400 text-xs uppercase">Event</p>
                 <p className="text-white font-medium mb-2">{result.ticket.eventName}</p>
                 <p className="text-slate-400 text-xs uppercase">Attendee</p>
                 <p className="text-white font-medium">{result.ticket.customerName}</p>
              </div>
            )}

            <button
              onClick={resetScanner}
              className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-transform hover:scale-105"
            >
              <RefreshCw size={20} /> Scan Next
            </button>
          </div>
        ) : (
          // Scanning View
          <div className="w-full h-full flex flex-col items-center">
            <div className="relative w-64 h-64 border-4 border-blue-500/50 rounded-2xl mb-8 flex items-center justify-center">
               <div className="absolute inset-0 border-t-4 border-blue-500 w-full animate-scan"></div>
               <Scan className="text-blue-500/30 w-32 h-32" />
               <p className="absolute -bottom-8 text-blue-400 font-mono text-sm animate-pulse">Waiting for scan...</p>
            </div>

            {/* Simulated Scanner Input */}
            <form onSubmit={handleScan} className="w-full max-w-sm relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter Ticket ID Manualy"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono"
                    autoFocus
                />
                <button type="submit" className="absolute right-2 top-2 bg-blue-600 p-1.5 rounded text-white hover:bg-blue-500">
                    GO
                </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">
                Note: In a production environment, this would access the webcam via <code>react-qr-reader</code>.
                For this demo, copy a Ticket ID from the Generator page and paste it here.
            </p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
            height: 2px;
            box-shadow: 0 0 10px #3b82f6;
        }
      `}</style>
    </div>
  );
};