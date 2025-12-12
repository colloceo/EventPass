import React, { useState, useEffect } from 'react';
import { getEvents, generateTicket } from '../services/mockBackend';
import { Event, Ticket } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export const TicketGenerator: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    const ticket = await generateTicket(selectedEventId, formData.name, formData.email);
    setGeneratedTicket(ticket);
    // Reset form but keep event selected
    setFormData({ name: '', email: '' });
  };

  const handleDownload = () => {
    const canvas = document.getElementById('ticket-qr') as HTMLCanvasElement;
    if(canvas) {
        // Converting SVG to image is complex in browser without deps, 
        // simple alert for demo purpose
        alert("In a real app, this would download a PDF or PNG of the ticket.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Issue New Ticket</h2>
          <p className="text-slate-500">Generate a ticket for a customer manually.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Choose an Event --</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} (${evt.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="john@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedEventId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Generate Ticket
          </button>
        </form>
      </div>

      {/* Ticket Preview */}
      <div className="flex flex-col items-center justify-center">
        {generatedTicket ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{generatedTicket.eventName}</h3>
            <p className="text-sm text-slate-500 mb-6">Admit One</p>

            <div className="bg-gray-50 p-6 rounded-xl mb-6 inline-block">
               <QRCodeSVG value={generatedTicket.id} size={180} level={"H"} />
            </div>

            <div className="text-left space-y-2 mb-6 border-t pt-4 border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Attendee</p>
                <p className="font-medium">{generatedTicket.customerName}</p>
                <p className="text-xs text-gray-500 uppercase font-semibold mt-2">Ticket ID</p>
                <p className="font-mono text-sm bg-gray-100 p-1 rounded text-center">{generatedTicket.id}</p>
            </div>

            <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-lg font-medium transition-colors"
            >
                <Download size={18} /> Download Ticket
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="bg-gray-100 w-64 h-80 rounded-2xl mx-auto mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-sm">Ticket Preview</span>
            </div>
            <p>Generate a ticket to see the QR code here.</p>
          </div>
        )}
      </div>
    </div>
  );
};