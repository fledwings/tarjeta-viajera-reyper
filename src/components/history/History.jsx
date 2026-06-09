import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, Search, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CardDetailsModal } from '../card/CardDetailsModal';

export function History() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  // Current week interval
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch all to do client-side filtering for simplicity, or we can use GTE/LTE
      // Using Supabase GTE/LTE
      const { data, error } = await supabase
        .from('traveler_cards')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (cards.length === 0) return;

    const headers = ['Fecha Creación', 'Proyecto', 'Cliente', 'Pieza', 'Cantidad', 'Estado', 'Prioridad'];
    const rows = cards.map(c => [
      format(parseISO(c.created_at), 'dd/MM/yyyy HH:mm'),
      c.proyecto,
      c.cliente,
      c.pieza_descripcion,
      c.cantidad,
      c.estado,
      c.prioridad
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_tarjetas_sem_${format(weekStart, 'ddMMyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCards = cards.filter(card => 
    card.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Historial Semanal</h2>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <CalendarIcon size={14} />
            {format(weekStart, "dd MMM", { locale: es })} al {format(weekEnd, "dd MMM, yyyy", { locale: es })}
          </p>
        </div>
        
        <button 
          onClick={exportToCSV}
          disabled={cards.length === 0}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center disabled:opacity-50"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en el historial..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E8640A]/20 focus:border-[#E8640A] text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Pieza</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                    Cargando historial...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                    No se encontraron tarjetas creadas en esta semana.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr 
                    key={card.id} 
                    className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-600">
                      {format(parseISO(card.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {card.proyecto}
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      {card.cliente}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-[200px] truncate" title={card.pieza_descripcion}>
                      {card.pieza_descripcion}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {card.cantidad}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${card.estado === 'Activa' ? 'bg-blue-100 text-blue-700' : 
                          card.estado === 'En proceso' ? 'bg-amber-100 text-amber-700' : 
                          card.estado === 'Bloqueada' ? 'bg-red-100 text-red-700' : 
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {card.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCard && (
        <CardDetailsModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </motion.div>
  );
}
