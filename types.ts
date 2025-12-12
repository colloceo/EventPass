export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  price: number;
  currency: string;
  description: string;
  feeModel: 'absorb' | 'pass_on'; // Who pays the fee?
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string; 
  customerName: string;
  customerEmail: string;
  status: 'unused' | 'used';
  createdAt: string;
  usedAt?: string;
  pricePaid: number; // Total amount paid
  platformFee: number; // The cut the system took
  netRevenue: number; // What the organizer gets
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
  grossSales: number;
  netRevenue: number;
  totalFeesCollected: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  limit: string;
  features: string[];
  isCurrent: boolean;
}