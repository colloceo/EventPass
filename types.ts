export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  price: number;
  description: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string; // Denormalized for easier display
  customerName: string;
  customerEmail: string;
  status: 'unused' | 'used';
  createdAt: string;
  usedAt?: string;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  ticket?: Ticket;
}

export interface Stats {
  totalEvents: number;
  totalTickets: number;
  ticketsUsed: number;
  revenue: number;
}