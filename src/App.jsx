import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { CardForm } from './components/card/CardForm';
import { History } from './components/history/History';

export default function App() {
  const [activeTab, setActiveTab] = useState('planeacion');
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-[#E8640A]/20">
      <Header />
      
      {!isCreating && (
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <main className="relative">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <CardForm 
              key="form"
              onCancel={() => setIsCreating(false)} 
              onSuccess={() => {
                setIsCreating(false);
                setActiveTab('planeacion');
              }} 
            />
          ) : (
            <React.Fragment key="content">
              {(activeTab === 'planeacion' || activeTab === 'operador' || activeTab === 'calidad') && (
                <Dashboard onNewCard={() => setIsCreating(true)} />
              )}
              {activeTab === 'historial' && (
                <History />
              )}
            </React.Fragment>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
