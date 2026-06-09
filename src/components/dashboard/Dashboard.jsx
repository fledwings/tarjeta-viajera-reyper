import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, Clock, ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { CardDetailsModal } from '../card/CardDetailsModal';

export function Dashboard({ onNewCard }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchCards();
    
    // Setup real-time subscription
    const channel = supabase
      .channel('traveler_cards_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'traveler_cards' }, 
        () => { fetchCards(); }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traveler_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card => 
    card.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.pieza_descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCards = filteredCards.filter(c => c.estado !== 'Cerrada');
  const metrics = {
    total: activeCards.length,
    enProceso: activeCards.filter(c => c.estado === 'En proceso').length,
    bloqueadas: activeCards.filter(c => c.estado === 'Bloqueada').length,
    cerradas: filteredCards.filter(c => c.estado === 'Cerrada').length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Tarjetas Activas</h2>
          <p className="text-zinc-500 text-sm mt-1">Gestión y seguimiento de producción</p>
        </div>
        
        <button 
          onClick={onNewCard}
          className="bg-[#E8640A] hover:bg-[#d05809] text-white px-5 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Nueva Tarjeta
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Activas" value={metrics.total} icon={<Activity size={20} className="text-blue-500" />} />
        <MetricCard title="En Proceso" value={metrics.enProceso} icon={<Clock size={20} className="text-amber-500" />} />
        <MetricCard title="Bloqueadas" value={metrics.bloqueadas} icon={<ShieldAlert size={20} className="text-red-500" />} />
        <MetricCard title="Cerradas" value={metrics.cerradas} icon={<CheckCircle2 size={20} className="text-emerald-500" />} />
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por proyecto, cliente o pieza..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E8640A]/20 focus:border-[#E8640A] text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50 text-sm font-medium transition-colors">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando tarjetas...</div>
        ) : activeCards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-zinc-200 border-dashed">
            <p className="text-zinc-500 mb-4">No hay tarjetas activas o que coincidan con la búsqueda.</p>
            <button 
              onClick={onNewCard}
              className="text-[#E8640A] font-medium hover:underline"
            >
              Crear la primera tarjeta
            </button>
          </div>
        ) : (
          activeCards.map(card => (
            <CardItem key={card.id} card={card} onClick={() => setSelectedCard(card)} />
          ))
        )}
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

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 flex items-center justify-between">
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">{title}</p>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
      </div>
      <div className="p-3 bg-zinc-50 rounded-full">
        {icon}
      </div>
    </div>
  );
}

function CardItem({ card, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Activa': return 'bg-blue-100 text-blue-700';
      case 'En proceso': return 'bg-amber-100 text-amber-700';
      case 'Bloqueada': return 'bg-red-100 text-red-700';
      case 'Cerrada': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-50 text-red-600 border border-red-200';
      case 'Crítica': return 'bg-purple-50 text-purple-600 border border-purple-200';
      default: return 'bg-zinc-50 text-zinc-600 border border-zinc-200';
    }
  };

  const totalOps = card.procesos?.length || 0;
  const progress = totalOps > 0 ? Math.min(100, Math.round((card.operacion_actual / totalOps) * 100)) : 0;
  
  const currentOpName = card.procesos?.[card.operacion_actual - 1]?.proceso || 'Pendiente inicio';

  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
      className="bg-white p-5 rounded-lg shadow-sm border border-zinc-200 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-zinc-900">{card.proyecto}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.estado)}`}>
              {card.estado}
            </span>
            {card.prioridad !== 'Normal' && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(card.prioridad)}`}>
                {card.prioridad}
              </span>
            )}
          </div>
          <p className="text-zinc-600 text-sm">
            <span className="font-medium text-zinc-900">{card.cliente}</span> • {card.pieza_descripcion}
          </p>
        </div>
        
        <div className="text-left md:text-right">
          <p className="text-sm text-zinc-500 mb-1">Cant. <span className="font-semibold text-zinc-900">{card.cantidad}</span></p>
          <p className="text-xs text-zinc-400">Entrega: {format(new Date(card.fecha_compromiso), 'dd MMM, yyyy')}</p>
        </div>
      </div>

      <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-700">Progreso (Op. {card.operacion_actual}/{totalOps})</span>
            <span className="text-zinc-500">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#E8640A] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex items-center gap-2 text-sm text-zinc-600 bg-white px-3 py-1.5 rounded border border-zinc-200">
          <Activity size={14} className="text-[#E8640A]" />
          <span className="truncate flex-1" title={currentOpName}>{currentOpName}</span>
        </div>
        <button className="text-zinc-400 hover:text-[#E8640A] p-1 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}
