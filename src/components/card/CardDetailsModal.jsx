import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, FileText, Layers, Map } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function CardDetailsModal({ card, onClose }) {
  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#FDFBF7] w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <FileText size={24} className="text-[#E8640A]" />
                Detalle de Tarjeta: {card.proyecto}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                ${card.estado === 'Activa' ? 'bg-blue-100 text-blue-700' : 
                  card.estado === 'En proceso' ? 'bg-amber-100 text-amber-700' : 
                  card.estado === 'Bloqueada' ? 'bg-red-100 text-red-700' : 
                  'bg-emerald-100 text-emerald-700'}`}
              >
                {card.estado}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Section 1: IDENTIFICACIÓN */}
            <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
              <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200 flex items-center gap-2">
                <FileText size={16} className="text-zinc-500" />
                <h3 className="font-bold text-zinc-800 text-sm tracking-wide">1. IDENTIFICACIÓN</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReadOnlyField label="Proyecto / Folio" value={card.proyecto} />
                <ReadOnlyField label="Partida" value={card.partida || '-'} />
                <ReadOnlyField label="Cliente" value={card.cliente} />
                <div className="lg:col-span-2">
                  <ReadOnlyField label="Pieza / Descripción" value={card.pieza_descripcion} />
                </div>
                <ReadOnlyField label="Plano / Revisión" value={card.plano_revision || '-'} />
                <ReadOnlyField label="Material" value={card.material || '-'} />
                <ReadOnlyField label="Cantidad" value={card.cantidad} />
                <ReadOnlyField 
                  label="Fecha Compromiso" 
                  value={card.fecha_compromiso ? format(parseISO(card.fecha_compromiso), 'dd/MM/yyyy') : '-'} 
                />
                <ReadOnlyField label="Prioridad" value={card.prioridad} />
              </div>
            </section>

            {/* Section 2: ESTADO DE MATERIAL */}
            <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
              <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200 flex items-center gap-2">
                <Layers size={16} className="text-zinc-500" />
                <h3 className="font-bold text-zinc-800 text-sm tracking-wide">2. ESTADO DE MATERIAL</h3>
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E8640A]"></span>
                  <span className="text-sm font-medium text-zinc-900">{card.estado_material || 'No especificado'}</span>
                </div>
              </div>
            </section>

            {/* Section 3: RUTA PLANEADA DE PROCESO */}
            <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
              <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200 flex items-center gap-2">
                <Map size={16} className="text-zinc-500" />
                <h3 className="font-bold text-zinc-800 text-sm tracking-wide">3. RUTA PLANEADA DE PROCESO</h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3 w-16 text-center">OP</th>
                      <th className="px-6 py-3">Proceso / Etapa</th>
                      <th className="px-6 py-3">Máquina Principal</th>
                      <th className="px-6 py-3">Máquina Alternativa</th>
                      <th className="px-6 py-3">Objetivo</th>
                      <th className="px-6 py-3">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.procesos && card.procesos.length > 0 ? (
                      card.procesos.map((p, index) => (
                        <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-3 text-center font-medium text-zinc-900">{p.op}</td>
                          <td className="px-6 py-3 text-zinc-800">{p.proceso || '-'}</td>
                          <td className="px-6 py-3 text-zinc-600">{p.maquinaPrincipal || '-'}</td>
                          <td className="px-6 py-3 text-zinc-600">{p.maquinaAlternativa || '-'}</td>
                          <td className="px-6 py-3 text-zinc-600">{p.objetivo || '-'}</td>
                          <td className="px-6 py-3 text-zinc-600">{p.responsable || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                          No hay operaciones registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-md font-medium hover:bg-zinc-50 transition-colors shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="text-sm font-medium text-zinc-900 bg-zinc-50/50 px-3 py-2 rounded-md border border-zinc-100">
        {value}
      </div>
    </div>
  );
}
