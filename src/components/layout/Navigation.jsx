import React from 'react';
import { motion } from 'framer-motion';

export function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'planeacion', label: 'Planeación' },
    { id: 'operador', label: 'Operador' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'historial', label: 'Historial Semanal' }
  ];

  return (
    <nav className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 md:space-x-4 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2 text-sm md:text-base font-medium rounded-md transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}
              `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#E8640A] rounded-md"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
