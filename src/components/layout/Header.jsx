import React from 'react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <div className="bg-[#E8640A] w-12 h-12 flex items-center justify-center rounded-sm font-bold text-3xl shrink-0">
          R
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider leading-tight">
            TARJETA VIAJERA
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 tracking-[0.2em]">
            REYPER MANUFACTURA
          </p>
        </div>
      </div>
    </header>
  );
}
