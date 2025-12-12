import { Event, Ticket, VerificationResult, Stats } from '../types';

// Keys for LocalStorage
const EVENTS_KEY = 'eventpass_events';
const TICKETS_KEY = 'eventpass_tickets';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Initialization ---
const initializeData = () => {
  if (!localStorage.getItem(EVENTS_KEY)) {
    const initialEvents: Event[] = [
      {
        id: 'evt_1',
        name: 'Tech Conference 2024',
        date: '2024-11-15',
        location: 'San Francisco, CA',
        price: 299,
        description: 'The biggest tech event of the year.',
      },
      {
        id: 'evt_2',
        name: 'Summer Music Festival',
        date: '2024-07-20',
        location: 'Austin, TX',
        price: 150,
        description: 'Live music, food, and fun.',
      },
    ];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(initialEvents));
  }
  if (!localStorage.getItem(TICKETS_KEY)) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify([]));
  }
};

initializeData();

// --- API Methods ---

export const getEvents = async (): Promise<Event[]> => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const events = await getEvents();
  const newEvent: Event = { ...event, id: generateId() };
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
};

export const getTickets = async (): Promise<Ticket[]> => {
  const data = localStorage.getItem(TICKETS_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateTicket = async (
  eventId: string,
  customerName: string,
  customerEmail: string
): Promise<Ticket> => {
  const events = await getEvents();
  const event = events.find((e) => e.id === eventId);
  if (!event) throw new Error('Event not found');

  const tickets = await getTickets();
  const newTicket: Ticket = {
    id: generateId(),
    eventId,
    eventName: event.name,
    customerName,
    customerEmail,
    status: 'unused',
    createdAt: new Date().toISOString(),
  };

  tickets.push(newTicket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  
  // In a real app, this would trigger an email service
  console.log(`[Email Service] Sending ticket ${newTicket.id} to ${customerEmail}`);
  
  return newTicket;
};

export const verifyTicket = async (ticketId: string): Promise<VerificationResult> => {
  const tickets = await getTickets();
  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

  if (ticketIndex === -1) {
    return { valid: false, message: 'Invalid Ticket ID' };
  }

  const ticket = tickets[ticketIndex];

  if (ticket.status === 'used') {
    return { valid: false, message: 'Ticket Already Used', ticket };
  }

  // Mark as used
  ticket.status = 'used';
  ticket.usedAt = new Date().toISOString();
  tickets[ticketIndex] = ticket;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

  return { valid: true, message: 'Ticket Valid & Checked In', ticket };
};

export const getStats = async (): Promise<Stats> => {
  const events = await getEvents();
  const tickets = await getTickets();
  
  const revenue = tickets.reduce((acc, ticket) => {
    const event = events.find(e => e.id === ticket.eventId);
    return acc + (event ? event.price : 0);
  }, 0);

  return {
    totalEvents: events.length,
    totalTickets: tickets.length,
    ticketsUsed: tickets.filter((t) => t.status === 'used').length,
    revenue,
  };
};