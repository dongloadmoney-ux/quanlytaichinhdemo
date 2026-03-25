import React, { useState } from 'react';
import { AuthProvider } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddClick={() => setShowAddForm(true)} />;
      case 'transactions':
        return <TransactionList />;
      case 'reports':
        return <Dashboard onAddClick={() => setShowAddForm(true)} />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminDashboard />;
      case 'add':
        return <TransactionList />; // Fallback for mobile FAB
      default:
        return <Dashboard onAddClick={() => setShowAddForm(true)} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Layout activeTab={activeTab} setActiveTab={(tab) => {
          if (tab === 'add') {
            setShowAddForm(true);
          } else {
            setActiveTab(tab);
          }
        }}>
          {renderContent()}
          {showAddForm && <TransactionForm onClose={() => setShowAddForm(false)} />}
        </Layout>
      </AuthProvider>
    </ErrorBoundary>
  );
}
