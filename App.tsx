import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';
import { TicketGenerator } from './pages/TicketGenerator';
import { Scanner } from './pages/Scanner';
import { Docs } from './pages/Docs';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'create-event':
        return <CreateEvent />;
      case 'generate-ticket':
        return <TicketGenerator />;
      case 'scanner':
        return <Scanner />;
      case 'docs':
        return <Docs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}