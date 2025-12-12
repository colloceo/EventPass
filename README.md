# EventPass - Event Ticket System

**Built by Collins Otieno**

EventPass is a complete Event Ticket Generation, Verification, and Management System designed for the modern event industry. It features a robust monetization engine, real-time financial tracking, professional ticket generation, and a seamless scanning interface.

## Key Features

### 1. Business & Monetization (New)
- **Subscription Models**: Integrated billing system with Basic, Standard, and Premium tiers to scale with event needs.
- **Smart Fee Calculator**:
  - **Pass-on Fee**: Automatically calculates and adds platform fees (e.g., 5% + KSh 30) to the customer's ticket price.
  - **Absorb Fee**: Allows organizers to absorb fees, deducting them from their net revenue.
- **Financial Analytics**: Dashboard now distinguishes between **Gross Sales** (Total money collected) and **Net Earnings** (Organizer profit after fees).

### 2. Professional Ticket Generation
- **Bulk Creation**: Import CSV lists (Name, Email) to generate hundreds of tickets in seconds.
- **Custom Design**: Toggle visibility for fields like Price, Location, Email, and Ticket ID.
- **Realistic Preview**: High-fidelity ticket rendering with perforation effects, branded headers, and QR codes.
- **Print & Download**: Optimized layouts for standard printing or individual PNG downloads.

### 3. Verification System
- **Live Scanner**: Browser-based QR scanner compatible with mobile cameras and webcams.
- **Manual Entry**: Fallback support for typing Ticket IDs manually (supports USB scanner guns).
- **Fraud Prevention**: Real-time validation checks for duplicate usage ("Double-entry") and invalid IDs.
- **Status Feedback**: Clear visual cues (Green/Red) for Access Granted or Denied.

### 4. Event Management
- Create events with support for multiple currencies (KES, USD, EUR).
- Real-time revenue estimation during event setup.
- Track attendance and usage stats.

## Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Generation**: qrcode.react
- **Backend Simulation**: LocalStorage (Simulates a Node.js/PostgreSQL environment for persistent browser demos)

## Usage Guide

1. **Dashboard**: View your Net Earnings, Gross Sales, and Ticket Sales trends.
2. **Create Event**: Set up an event and choose your **Fee Model** (Absorb vs Pass-on) to see projected earnings.
3. **Billing**: Navigate to the Billing tab to upgrade your subscription plan based on your monthly ticket volume.
4. **Issue Ticket**:
   - Use **Single Mode** for one-off VIP tickets.
   - Use **Bulk Import** to paste a CSV list of attendees.
   - Customize the ticket look using the "Visible Fields" toggles.
5. **Scanner**: Open the Scanner on a mobile device or laptop at the gate to verify attendees.

---

**Developed by Collins Otieno**