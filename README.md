# EventPass - Event Ticket System

**Built by Collins Otieno**

EventPass is a comprehensive web-based system designed for generating, managing, and verifying event tickets. It features a modern dashboard, custom currency support, professional ticket printing, and real-time verification.

## Features

### 1. Admin Dashboard
- **Real-time Statistics**: Monitor total revenue, tickets sold, and active check-ins.
- **Multi-Currency Support**: View revenue in the specific currency of your event (e.g., USD, KES, EUR).
- **Visual Analytics**: Interactive bar charts displaying ticket usage status.
- **Event Overview**: Quick access to recent events and their performance.

### 2. Event Management
- Create distinct events with specific details:
  - Event Name
  - Date & Time
  - Location/Venue
  - **Custom Pricing & Currency**
  - Description

### 3. Ticket Generation
- Issue tickets for specific events.
- Capture customer details (Name, Email).
- **QR Code Integration**: Automatically generates a unique QR code for every ticket.
- **Print & Download**: 
  - Generate high-quality PNG ticket images.
  - Print optimized tickets directly from the browser.

### 4. Verification System
- **Scanner Interface**: Built-in scanner to verify tickets.
- **Validation Logic**: 
  - Checks if the ticket exists.
  - Verifies if the ticket belongs to the correct event.
  - Prevents reuse of tickets (Double-entry protection).
- Visual feedback for "Access Granted" or "Access Denied".

## Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Generation**: qrcode.react
- **Backend Simulation**: LocalStorage (simulating a Node.js/PostgreSQL environment for browser demo purposes)

## Usage Guide

1. **Dashboard**: View the overall system health.
2. **Create Event**: Go to the "Create Event" tab to add a new event to the system. You can specify the currency code (e.g., USD, KES).
3. **Issue Ticket**: Navigate to "Issue Ticket", select your created event, and generate a ticket for a user.
4. **Print/Download**: Once generated, use the buttons to download a PNG or print the ticket immediately.
5. **Verify**: Copy the generated **Ticket ID**, go to the "Scanner" tab, and enter/scan the ID to verify the ticket status.

---

**Developed by Collins Otieno**