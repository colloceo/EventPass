import React, { useState } from 'react';
import { createEvent } from '../services/mockBackend';
import { Calendar, MapPin, DollarSign, Type, AlignLeft, Image as ImageIcon, CheckCircle2, ArrowRight } from 'lucide-react';

export const CreateEvent: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    price: '',
    currency: 'USD',
    description: '',
  });
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await createEvent({
      name: formData.name,
      date: formData.date,
      location: formData.location,
      price: Number(formData.price),
      currency: formData.currency,
      description: formData.description,
    });
    
    setSuccess('Event created successfully!');
    setFormData({ name: '', date: '', location: '', price: '', currency: 'USD', description: '' });
    setIsSubmitting(false);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to format date for preview
  const previewDate = formData.date ? new Date(formData.date) : new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Event</h2>
           <p className="text-slate-500 mt-1">Set up the details for your next big event.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 space-y-6">
                
                {/* Event Name */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Event Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Type size={18} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
                            placeholder="e.g. Summer Music Festival 2024"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Date</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Price & Currency */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Price</label>
                        <div className="flex gap-2">
                             <div className="relative w-24">
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium appearance-none"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="KES">KES</option>
                                </select>
                             </div>
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <DollarSign size={18} />
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Location</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <MapPin size={18} />
                        </div>
                        <input
                            type="text"
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
                            placeholder="Venue Name or Address"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                    <div className="relative group">
                        <div className="absolute top-3 left-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <AlignLeft size={18} />
                        </div>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                            placeholder="Tell people what this event is about..."
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            'Creating Event...'
                        ) : (
                            <>
                                Create Event <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>

                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={20} className="flex-shrink-0" />
                        <span className="font-medium">{success}</span>
                    </div>
                )}
            </form>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
                <div>
                     <h3 className="text-lg font-bold text-slate-900 mb-2">Live Preview</h3>
                     <p className="text-sm text-slate-500">How your event will appear on the dashboard.</p>
                </div>

                {/* Preview Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 group relative overflow-hidden">
                    {/* Simulated "New" Badge */}
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        New
                    </div>

                    <div className="flex items-start gap-4">
                        {/* Date Badge */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                {monthNames[previewDate.getMonth()]}
                            </span>
                            <span className="text-xl font-bold text-slate-800 leading-none">
                                {formData.date ? previewDate.getDate() : '--'}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="font-bold text-slate-900 text-base leading-tight truncate">
                                {formData.name || 'Event Name'}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5 truncate">
                                <MapPin size={12} />
                                <span className="truncate">{formData.location || 'Location'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 truncate">
                                <DollarSign size={12} />
                                <span>{formData.currency} {formData.price || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Preview */}
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
                         <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {formData.description || 'Event description will appear here...'}
                         </p>
                    </div>
                </div>

                {/* Additional Tip Box */}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <ImageIcon size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Pro Tip</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                Precise location names help attendees find venues on maps easier. Ensure the price code matches your local currency.
                            </p>
                        </div>
                     </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};