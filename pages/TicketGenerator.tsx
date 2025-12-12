import React, { useState, useEffect, useRef } from 'react';
import { getEvents, generateTicket } from '../services/mockBackend';
import { Event, Ticket as TicketType } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Download, Printer, Ticket, User, Mail, Calendar, 
  Sparkles, CheckCircle2, Users, Layers, MapPin, 
  DollarSign, Settings2, FileText, ChevronDown, LayoutTemplate
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
    showEmail: false,
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
    
    const qrElement = document.getElementById(`qr-${ticket.id}`) as HTMLCanvasElement;
    if (!ctx || !qrElement) return null;

    const width = 400;
    const height = 700;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top Strip
    ctx.fillStyle = '#1e293b'; // Slate-900
    ctx.fillRect(0, 0, width, 20);

    let currentY = 80;

    // Event Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(event.name, width / 2, currentY);
    currentY += 40;

    // Admit One
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Admit One', width / 2, currentY);
    currentY += 50;

    // QR Code
    ctx.drawImage(qrElement, (width - 200) / 2, currentY, 200, 200);
    currentY += 240;

    // Dynamic Fields
    const drawField = (label: string, value: string) => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(label.toUpperCase(), width / 2, currentY);
        currentY += 25;
        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(value, width / 2, currentY);
        currentY += 50;
    };

    if (ticketOptions.showName) drawField('Attendee', ticket.customerName);
    if (ticketOptions.showEmail && ticket.customerEmail) drawField('Email', ticket.customerEmail);
    if (ticketOptions.showDate) drawField('Date', new Date(event.date).toLocaleDateString());
    if (ticketOptions.showLocation) drawField('Location', event.location);
    if (ticketOptions.showPrice) drawField('Price', `${event.currency} ${event.price.toFixed(2)}`);
    if (ticketOptions.showId) {
         ctx.fillStyle = '#94a3b8';
         ctx.font = 'bold 12px sans-serif';
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
    if (!ticketRef.current) return;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Ticket</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('</head><body class="bg-white p-8 flex flex-col items-center">');
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
    <div className="max-w-7xl mx-auto px-2">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Issue Tickets</h2>
         <p className="text-slate-500 mt-1">Generate individual or bulk tickets with custom designs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Configuration */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <LayoutTemplate size={18} className="text-blue-500" />
                    Configuration
                </h3>
             </div>
             
             <div className="p-6 space-y-6">
                {/* Event Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event</label>
                    <div className="relative">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-8 font-medium transition-all hover:bg-slate-100 cursor-pointer outline-none"
                        >
                            <option value="">Select an event...</option>
                            {events.map((evt) => (
                                <option key={evt.id} value={evt.id}>
                                    {evt.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                {/* Mode Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
                    <button
                        onClick={() => { setMode('single'); setGeneratedTickets([]); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                            mode === 'single' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <User size={16} /> Single
                    </button>
                    <button
                        onClick={() => { setMode('bulk'); setGeneratedTickets([]); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                            mode === 'bulk' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users size={16} /> Bulk Import
                    </button>
                </div>

                {/* Form Inputs */}
                {mode === 'single' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendee Name</label>
                            <input
                                type="text"
                                value={singleData.name}
                                onChange={(e) => setSingleData({ ...singleData, name: e.target.value })}
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={singleData.email}
                                onChange={(e) => setSingleData({ ...singleData, email: e.target.value })}
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. john@company.com"
                            />
                        </div>
                        <button
                            onClick={handleSingleSubmit}
                            disabled={!selectedEventId || isSubmitting || !singleData.name}
                            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Processing...' : <><Sparkles size={18} /> Generate Ticket</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CSV Data</label>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Name, Email</span>
                            </div>
                            <div className="relative">
                                <textarea
                                    ref={bulkInputRef}
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm h-48 resize-none leading-relaxed"
                                    placeholder={`John Doe, john@example.com\nAlice Smith, alice@test.com`}
                                />
                                <div className="absolute bottom-3 right-3 pointer-events-none opacity-50">
                                    <FileText size={16} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                        
                        {isSubmitting ? (
                            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                                    <span>Processing</span>
                                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleBulkSubmit}
                                disabled={!selectedEventId || !bulkData.trim()}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Layers size={18} /> Generate Batch
                            </button>
                        )}
                    </div>
                )}
             </div>
          </div>

          {/* Ticket Design Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Settings2 size={18} className="text-blue-500" />
                    Visible Fields
                 </h3>
                 <span className="text-xs font-medium text-slate-400">Customize ticket layout</span>
             </div>
             
             <div className="p-4 grid grid-cols-2 gap-3">
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all duration-200 select-none ${
                            ticketOptions[opt.key as keyof TicketOptions] 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                             ticketOptions[opt.key as keyof TicketOptions] ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-100 border-slate-300'
                        }`}>
                             {ticketOptions[opt.key as keyof TicketOptions] && <CheckCircle2 size={10} />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                    </button>
                 ))}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Preview & Results */}
        <div className="xl:col-span-7">
             
             {!selectedEvent ? (
                 <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 h-[600px] flex flex-col items-center justify-center text-slate-400">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <Ticket size={48} className="opacity-20 text-slate-900" />
                    </div>
                    <p className="font-bold text-lg text-slate-500">No Event Selected</p>
                    <p className="text-sm">Choose an event to start generating tickets</p>
                 </div>
             ) : (
                 <div className="bg-slate-900 rounded-3xl p-8 min-h-[600px] flex flex-col items-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    {generatedTickets.length > 0 ? (
                        <div className="w-full max-w-sm relative z-10 flex flex-col h-full">
                            
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-6 text-white/80">
                                <div className="text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    {generatedTickets.length} Generated
                                </div>
                                {generatedTickets.length > 1 && (
                                    <button 
                                        onClick={handlePrint}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-bold transition-colors backdrop-blur-md border border-white/10"
                                    >
                                        Print All
                                    </button>
                                )}
                            </div>

                            {/* Scrollable Container */}
                            <div ref={ticketRef} className="space-y-8 overflow-y-auto pr-2 custom-scrollbar max-h-[700px] pb-20">
                                {generatedTickets.map((ticket) => (
                                    <div key={ticket.id} className="group relative transition-transform hover:scale-[1.01] duration-300">
                                        
                                        {/* Physical Ticket Shape */}
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative">
                                            
                                            {/* Decorative Top Strip */}
                                            <div className="h-4 bg-slate-900 w-full relative overflow-hidden">
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                            </div>

                                            <div className="p-6 pb-4 text-center">
                                                <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{selectedEvent.name}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Official Entry Pass</p>
                                                
                                                <div className="flex justify-center mb-6">
                                                    <div className="p-3 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                                                        <QRCodeCanvas 
                                                            id={`qr-${ticket.id}`}
                                                            value={ticket.id} 
                                                            size={150} 
                                                            level={"H"} 
                                                            includeMargin={true}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Dynamic Fields */}
                                                <div className="space-y-4 px-4">
                                                    {ticketOptions.showName && (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendee</p>
                                                            <p className="text-lg font-bold text-slate-900 truncate">{ticket.customerName}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {(ticketOptions.showDate || ticketOptions.showPrice) && (
                                                        <div className="flex justify-center gap-6 border-t border-slate-100 pt-3">
                                                            {ticketOptions.showDate && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                                                    <p className="text-sm font-bold text-slate-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                                                                </div>
                                                            )}
                                                            {ticketOptions.showPrice && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</p>
                                                                    <p className="text-sm font-bold text-slate-700">{selectedEvent.currency} {selectedEvent.price}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Perforation Line Visual */}
                                            <div className="relative flex items-center w-full my-2">
                                                <div className="w-5 h-10 bg-slate-900 rounded-r-full absolute -left-0.5"></div>
                                                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-5"></div>
                                                <div className="w-5 h-10 bg-slate-900 rounded-l-full absolute -right-0.5"></div>
                                            </div>

                                            {/* Stub */}
                                            <div className="bg-slate-50 p-4 pt-2 text-center pb-6">
                                                {ticketOptions.showId && (
                                                    <>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket ID</p>
                                                        <code className="text-sm font-mono font-semibold text-slate-600 tracking-wide">{ticket.id}</code>
                                                    </>
                                                )}
                                                {ticketOptions.showLocation && (
                                                     <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-slate-500">
                                                        <MapPin size={10} /> {selectedEvent.location}
                                                     </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                            <button 
                                                onClick={() => handleDownloadSingle(ticket)}
                                                className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                                                title="Download PNG"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ) : (
                         // Empty State / Placeholder
                         <div className="flex flex-col items-center justify-center h-full opacity-40">
                              <div className="bg-white w-[320px] h-[480px] rounded-2xl shadow-2xl relative overflow-hidden animate-pulse">
                                   <div className="h-4 bg-slate-800 w-full"></div>
                                   <div className="p-8 space-y-8 flex flex-col items-center mt-8">
                                       <div className="w-32 h-6 bg-slate-200 rounded"></div>
                                       <div className="w-40 h-40 bg-slate-200 rounded"></div>
                                       <div className="w-full space-y-3">
                                            <div className="w-full h-4 bg-slate-200 rounded"></div>
                                            <div className="w-2/3 h-4 bg-slate-200 rounded mx-auto"></div>
                                       </div>
                                   </div>
                              </div>
                              <p className="text-slate-500 mt-8 font-medium tracking-wide">Preview will appear here</p>
                         </div>
                    )}
                 </div>
             )}
        </div>

      </div>
    </div>
  );
};