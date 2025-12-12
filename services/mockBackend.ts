import { Event, Ticket, VerificationResult, Stats, SubscriptionPlan } from '../types';

// Keys for LocalStorage
const EVENTS_KEY = 'eventpass_events';
const TICKETS_KEY = 'eventpass_tickets';
const SUB_KEY = 'eventpass_subscription';

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Business Logic Settings ---
const COMMISSION_RATE = 0.05; // 5%
const FIXED_FEE = 30; // KSh 30 or equivalent units

const initializeData = () => {
  if (!localStorage.getItem(EVENTS_KEY)) {
    const initialEvents: Event[] = [
      {
        id: 'evt_1',
        name: 'Tech Conference 2024',
        date: '2024-11-15',
        location: 'San Francisco, CA',
        price: 299,
        currency: 'USD',
        description: 'The biggest tech event of the year.',
        feeModel: 'pass_on'
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

  // Monetization Logic
  const basePrice = event.price;
  let platformFee = 0;
  let pricePaid = 0;
  let netRevenue = 0;

  if (basePrice > 0) {
      // Calculate Commission (5% + 30)
      const calculatedFee = (basePrice * COMMISSION_RATE) + (event.currency === 'KES' ? 30 : 0.50);
      platformFee = parseFloat(calculatedFee.toFixed(2));

      if (event.feeModel === 'pass_on') {
          pricePaid = basePrice + platformFee;
          netRevenue = basePrice;
      } else {
          // Absorb
          pricePaid = basePrice;
          netRevenue = basePrice - platformFee;
      }
  }

  const tickets = await getTickets();
  const newTicket: Ticket = {
    id: generateId(),
    eventId,
    eventName: event.name,
    customerName,
    customerEmail,
    status: 'unused',
    createdAt: new Date().toISOString(),
    pricePaid,
    platformFee,
    netRevenue
  };

  tickets.push(newTicket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  
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

  ticket.status = 'used';
  ticket.usedAt = new Date().toISOString();
  tickets[ticketIndex] = ticket;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

  return { valid: true, message: 'Ticket Valid & Checked In', ticket };
};

export const getStats = async (): Promise<Stats> => {
  const events = await getEvents();
  const tickets = await getTickets();
  
  // Calculate Financials based on recorded ticket data
  const grossSales = tickets.reduce((acc, t) => acc + (t.pricePaid || 0), 0);
  const netRevenue = tickets.reduce((acc, t) => acc + (t.netRevenue || 0), 0);
  const totalFeesCollected = tickets.reduce((acc, t) => acc + (t.platformFee || 0), 0);

  return {
    totalEvents: events.length,
    totalTickets: tickets.length,
    ticketsUsed: tickets.filter((t) => t.status === 'used').length,
    grossSales,
    netRevenue,
    totalFeesCollected
  };
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    const currentPlanId = localStorage.getItem(SUB_KEY) || 'basic';
    
    return [
        {
            id: 'basic',
            name: 'Basic Plan',
            price: 2500,
            currency: 'KES',
            limit: '300 Tickets/mo',
            features: ['Standard Dashboard', 'Email Support', 'Mobile Scanning'],
            isCurrent: currentPlanId === 'basic'
        },
        {
            id: 'standard',
            name: 'Standard Plan',
            price: 8000,
            currency: 'KES',
            limit: '2,000 Tickets/mo',
            features: ['Advanced Analytics', 'Priority Support', 'Scanner Rental Option', 'Custom Branding'],
            isCurrent: currentPlanId === 'standard'
        },
        {
            id: 'premium',
            name: 'Premium Plan',
            price: 25000,
            currency: 'KES',
            limit: 'Unlimited',
            features: ['Dedicated Account Manager', 'White-labeling', 'On-site Crew', 'API Access'],
            isCurrent: currentPlanId === 'premium'
        }
    ];
};

export const upgradePlan = async (planId: string) => {
    localStorage.setItem(SUB_KEY, planId);
    return true;
};