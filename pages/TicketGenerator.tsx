import React, { useState, useEffect, useRef } from 'react';
import { getEvents, generateTicket } from '../services/mockBackend';
import { Event, Ticket as TicketType } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Download, Printer, Ticket, User, Mail, Calendar, 
  Sparkles, CheckCircle2, Users, Layers, MapPin, 
  DollarSign, Settings2, FileText 
} from 'lucide-react';

interface TicketOptions {
  showName: boolean;
  showEmail: boolean;
  showDate: boolean;
  showLocation: boolean;
  showPrice: boolean;
  showId: boolean;
}

export const TicketGenerator: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  // Modes: 'single' | 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  
  // Form Data
  const [singleData, setSingleData] = useState({ name: '', email: '' });
  const [bulkData, setBulkData] = useState('');
  
  // Options
  const [ticketOptions, setTicketOptions] = useState<TicketOptions>({
    showName: true,
    showEmail: false, // Default hidden to keep clean
    showDate: true,
    showLocation: true,
    showPrice: false,
    showId: true,
  });

  // State
  const [generatedTickets, setGeneratedTickets] = useState<TicketType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const ticketRef = useRef<HTMLDivElement>(null);
  const bulkInputRef = useRef<HTMLTextAreaElement>(null);

  // Derived
  const selectedEvent = events.find(e => e.id === selectedEventId);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // UX delay

    const ticket = await generateTicket(selectedEventId, singleData.name, singleData.email);
    setGeneratedTickets([ticket]); // Replace previous
    setSingleData({ name: '', email: '' });
    setIsSubmitting(false);
  };

  const handleBulkSubmit = async () => {
    if (!selectedEventId || !bulkData.trim()) return;
    
    const lines = bulkData.split('\n').filter(line => line.trim().length > 0);
    const parsed = lines.map(line => {
      const [name, email] = line.split(',').map(s => s.trim());
      return { name: name || 'Guest', email: email || '' };
    });

    if (parsed.length === 0) return;

    setIsSubmitting(true);
    setGeneratedTickets([]); // Clear previous
    setProgress({ current: 0, total: parsed.length });

    const newTickets: TicketType[] = [];

    for (let i = 0; i < parsed.length; i++) {
      // Simulate individual processing time
      await new Promise(resolve => setTimeout(resolve, 300));
      const { name, email } = parsed[i];
      const ticket = await generateTicket(selectedEventId, name, email);
      newTickets.push(ticket);
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setGeneratedTickets(newTickets);
    setIsSubmitting(false);
    setBulkData('');
  };

  const toggleOption = (key: keyof TicketOptions) => {
    setTicketOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Canvas Generation Logic
  const generateTicketImage = (ticket: TicketType, event: Event): string | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Hack: We need the specific QR code for this ticket. 
    // In bulk mode, we can't easily grab DOM elements for all. 
    // We'll rely on the visible one for single download, or regenerate QR dataUrl for bulk.
    // For simplicity in this demo, 'Download' works best on Single ticket view.
    // We'll use a generic placeholder approach if DOM missing, but let's try to get the DOM element if available.
    // A robust solution would generate QR on the fly using a library helper, but we are using `qrcode.react` component.
    // For this demo, we will restrict "Download PNG" to the currently previewed ticket or single mode.
    
    const qrElement = document.getElementById(`qr-${ticket.id}`) as HTMLCanvasElement;
    if (!ctx || !qrElement) return null;

    const width = 400;
    const height = 700; // Taller to fit fields
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top Strip
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, width, 15);

    let currentY = 60;

    // Event Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(event.name, width / 2, currentY);
    currentY += 30;

    // Admit One
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Admit One', width / 2, currentY);
    currentY += 40;

    // QR Code
    ctx.drawImage(qrElement, (width - 200) / 2, currentY, 200, 200);
    currentY += 230;

    // Dynamic Fields
    const drawField = (label: string, value: string) => {
        ctx.fillStyle = '#94a3b8'; // Label color
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(label.toUpperCase(), width / 2, currentY);
        currentY += 25;
        
        ctx.fillStyle = '#1e293b'; // Value color
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(value, width / 2, currentY);
        currentY += 45; // Spacing
    };

    if (ticketOptions.showName) drawField('Attendee', ticket.customerName);
    if (ticketOptions.showEmail && ticket.customerEmail) drawField('Email', ticket.customerEmail);
    if (ticketOptions.showDate) drawField('Date', new Date(event.date).toLocaleDateString());
    if (ticketOptions.showLocation) drawField('Location', event.location);
    if (ticketOptions.showPrice) drawField('Price', `${event.currency} ${event.price.toFixed(2)}`);
    if (ticketOptions.showId) {
         ctx.fillStyle = '#94a3b8';
         ctx.font = 'bold 11px sans-serif';
         ctx.fillText('TICKET ID', width / 2, currentY);
         currentY += 25;
         
         ctx.fillStyle = '#334155';
         ctx.font = 'monospace 16px sans-serif';
         ctx.fillText(ticket.id, width / 2, currentY);
    }

    return canvas.toDataURL('image/png');
  };

  const handleDownloadSingle = (ticket: TicketType) => {
    if (!selectedEvent) return;
    const dataUrl = generateTicketImage(ticket, selectedEvent);
    if (dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `ticket-${ticket.id}.png`;
        link.click();
    }
  };

  const handlePrint = () => {
    // Print whatever is in the ticket preview container
    if (!ticketRef.current) return;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Ticket</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('</head><body class="bg-white p-8">');
      // If bulk, we might want to print all generated tickets. 
      // For now, let's print the preview area which contains the generated tickets list or single card.
      printWindow.document.write(ticketRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Issue Tickets</h2>
         <p className="text-slate-500 mt-1">Generate individual or bulk tickets with custom designs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Configuration */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
             {/* Event Selector */}
             <div className="space-y-1.5 mb-6">
                <label className="block text-sm font-semibold text-slate-700">Select Event</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={18} />
                    </div>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium appearance-none"
                    >
                        <option value="">-- Choose an Event --</option>
                        {events.map((evt) => (
                            <option key={evt.id} value={evt.id}>
                                {evt.name} ({evt.currency} {evt.price})
                            </option>
                        ))}
                    </select>
                </div>
             </div>

             {/* Mode Tabs */}
             <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                    onClick={() => { setMode('single'); setGeneratedTickets([]); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <User size={16} /> Single Ticket
                </button>
                <button
                    onClick={() => { setMode('bulk'); setGeneratedTickets([]); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'bulk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users size={16} /> Bulk Create
                </button>
             </div>

             {/* Form Inputs */}
             {mode === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Customer Name</label>
                        <input
                            type="text"
                            required
                            value={singleData.name}
                            onChange={(e) => setSingleData({ ...singleData, name: e.target.value })}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Customer Email</label>
                        <input
                            type="email"
                            required
                            value={singleData.email}
                            onChange={(e) => setSingleData({ ...singleData, email: e.target.value })}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            placeholder="e.g. john@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedEventId || isSubmitting}
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Generating...' : <><Sparkles size={18} /> Generate Ticket</>}
                    </button>
                </form>
             ) : (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 flex justify-between">
                            <span>CSV Input (Name, Email)</span>
                            <span className="text-xs text-slate-400 font-normal">One per line</span>
                        </label>
                        <textarea
                            ref={bulkInputRef}
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm h-48 resize-none"
                            placeholder={`John Doe, john@example.com\nAlice Smith, alice@test.com\nBob Jones, bob@test.com`}
                        />
                    </div>
                    {isSubmitting ? (
                        <div className="w-full bg-slate-100 rounded-xl p-4">
                            <div className="flex justify-between text-sm font-medium mb-2 text-slate-700">
                                <span>Generating tickets...</span>
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleBulkSubmit}
                            disabled={!selectedEventId || !bulkData.trim()}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Layers size={18} /> Generate All Tickets
                        </button>
                    )}
                </div>
             )}
          </div>

          {/* Ticket Design Options */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
             <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Settings2 size={20} />
                <h3 className="font-bold text-lg">Ticket Design</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 {[
                    { key: 'showName', label: 'Attendee Name', icon: User },
                    { key: 'showEmail', label: 'Attendee Email', icon: Mail },
                    { key: 'showDate', label: 'Event Date', icon: Calendar },
                    { key: 'showLocation', label: 'Location', icon: MapPin },
                    { key: 'showPrice', label: 'Price', icon: DollarSign },
                    { key: 'showId', label: 'Ticket ID', icon: FileText },
                 ].map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => toggleOption(opt.key as keyof TicketOptions)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            ticketOptions[opt.key as keyof TicketOptions] 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {ticketOptions[opt.key as keyof TicketOptions] && <CheckCircle2 size={14} className="flex-shrink-0" />}
                        <span className="truncate">{opt.label}</span>
                    </button>
                 ))}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Preview & Results */}
        <div className="xl:col-span-7 bg-slate-50/50 min-h-[600px] rounded-2xl border border-slate-200 p-8 flex flex-col items-center">
             
             {!selectedEvent ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <Ticket size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Select an event to view ticket preview</p>
                 </div>
             ) : generatedTickets.length > 0 ? (
                 <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 space-y-6">
                    
                    {generatedTickets.length > 1 && (
                        <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 font-bold">
                                <CheckCircle2 size={20} /> 
                                <span>{generatedTickets.length} Tickets Generated</span>
                            </div>
                            <button 
                                onClick={handlePrint}
                                className="bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                Print All
                            </button>
                        </div>
                    )}

                    <div ref={ticketRef} className={`space-y-8 ${generatedTickets.length > 1 ? 'max-h-[800px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                        {generatedTickets.map((ticket, idx) => (
                            <div key={ticket.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative break-inside-avoid">
                                <div className="bg-blue-600 h-4 w-full"></div>
                                <div className="p-8 pb-6 text-center">
                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedEvent.name}</h3>
                                    <p className="text-sm font-medium text-slate-500 tracking-wide uppercase mb-6">Admit One</p>
                                    
                                    <div className="flex justify-center mb-8">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                            <QRCodeCanvas 
                                                id={`qr-${ticket.id}`}
                                                value={ticket.id} 
                                                size={160} 
                                                level={"H"} 
                                                includeMargin={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Fields Section */}
                                    <div className="space-y-4">
                                        {ticketOptions.showName && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendee</p>
                                                <p className="text-lg font-bold text-slate-900">{ticket.customerName}</p>
                                            </div>
                                        )}
                                        {ticketOptions.showEmail && ticket.customerEmail && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                                <p className="text-base font-medium text-slate-700">{ticket.customerEmail}</p>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-8">
                                            {ticketOptions.showDate && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                                    <p className="text-base font-bold text-slate-800">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {ticketOptions.showPrice && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                                                    <p className="text-base font-bold text-slate-800">{selectedEvent.currency} {selectedEvent.price}</p>
                                                </div>
                                            )}
                                        </div>
                                        {ticketOptions.showLocation && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Venue</p>
                                                <p className="text-base font-medium text-slate-700">{selectedEvent.location}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Perforation */}
                                <div className="relative flex items-center w-full my-2">
                                    <div className="w-4 h-8 bg-slate-50 rounded-r-full border-y border-r border-slate-200 absolute -left-[1px]"></div>
                                    <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-4"></div>
                                    <div className="w-4 h-8 bg-slate-50 rounded-l-full border-y border-l border-slate-200 absolute -right-[1px]"></div>
                                </div>

                                {ticketOptions.showId && (
                                    <div className="p-4 bg-slate-50/80 text-center pb-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket ID</p>
                                        <code className="text-sm font-mono text-slate-600">{ticket.id}</code>
                                    </div>
                                )}
                                
                                <div className="absolute top-4 right-4 print:hidden">
                                     <button 
                                        onClick={() => handleDownloadSingle(ticket)}
                                        className="p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                                        title="Download PNG"
                                     >
                                        <Download size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             ) : (
                 // Live Preview (Placeholder Data)
                 <div className="w-full max-w-md opacity-60 pointer-events-none scale-95 blur-[1px] select-none">
                      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200">
                           <div className="bg-slate-300 h-4 w-full"></div>
                           <div className="p-8 text-center space-y-6">
                               <div className="h-6 w-3/4 bg-slate-200 rounded mx-auto"></div>
                               <div className="h-4 w-1/4 bg-slate-200 rounded mx-auto"></div>
                               <div className="w-40 h-40 bg-slate-100 rounded mx-auto"></div>
                               <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto"></div>
                           </div>
                      </div>
                      <p className="text-center text-slate-500 mt-4 font-medium">Preview will appear here</p>
                 </div>
             )}
        </div>

      </div>
    </div>
  );
};