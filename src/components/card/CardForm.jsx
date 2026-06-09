import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CardForm({ onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  // Section 1 State
  const [formData, setFormData] = useState({
    proyecto: '',
    partida: '',
    cliente: '',
    pieza_descripcion: '',
    material: '',
    cantidad: '',
    fecha_compromiso: '',
    prioridad: 'Normal',
    plano_revision: '',
    estado_material: 'Disponible en almacén',
  });

  // Section 3 State
  const [procesos, setProcesos] = useState([
    { op: 1, proceso: '', maquinaPrincipal: '', maquinaAlternativa: '', objetivo: '', responsable: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProcesoChange = (index, field, value) => {
    const newProcesos = [...procesos];
    newProcesos[index][field] = value;
    setProcesos(newProcesos);
  };

  const addProceso = () => {
    setProcesos([
      ...procesos, 
      { op: procesos.length + 1, proceso: '', maquinaPrincipal: '', maquinaAlternativa: '', objetivo: '', responsable: '' }
    ]);
  };

  const removeProceso = (index) => {
    const newProcesos = procesos.filter((_, i) => i !== index).map((p, i) => ({ ...p, op: i + 1 }));
    setProcesos(newProcesos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const cardData = {
        ...formData,
        cantidad: parseInt(formData.cantidad, 10),
        procesos: procesos,
        estado: 'Activa',
        operacion_actual: 1
      };

      const { error } = await supabase
        .from('traveler_cards')
        .insert([cardData]);

      if (error) throw error;
      
      onSuccess();
    } catch (err) {
      console.error('Error saving card:', err);
      alert('Error al guardar la tarjeta. Por favor verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  const estadosMaterial = [
    'Disponible en almacén', 'Material recuperado', 'Falta comprar', 
    'En requisición', 'En OC', 'Recibido', 'Sustitución autorizada'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onCancel}
          className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Nueva Tarjeta Viajera</h2>
          <p className="text-zinc-500 text-sm">Creación de orden de producción</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: IDENTIFICACIÓN */}
        <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200">
            <h3 className="font-bold text-zinc-800 text-sm tracking-wide">1. IDENTIFICACIÓN</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormGroup label="Proyecto / Folio *" name="proyecto" value={formData.proyecto} onChange={handleInputChange} required />
            <FormGroup label="Partida" name="partida" value={formData.partida} onChange={handleInputChange} />
            <FormGroup label="Cliente *" name="cliente" value={formData.cliente} onChange={handleInputChange} required />
            <div className="lg:col-span-2">
              <FormGroup label="Pieza / Descripción *" name="pieza_descripcion" value={formData.pieza_descripcion} onChange={handleInputChange} required />
            </div>
            <FormGroup label="Plano / Revisión" name="plano_revision" value={formData.plano_revision} onChange={handleInputChange} />
            <FormGroup label="Material" name="material" value={formData.material} onChange={handleInputChange} />
            <FormGroup label="Cantidad *" name="cantidad" type="number" min="1" value={formData.cantidad} onChange={handleInputChange} required />
            <FormGroup label="Fecha Compromiso *" name="fecha_compromiso" type="date" value={formData.fecha_compromiso} onChange={handleInputChange} required />
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">Prioridad *</label>
              <select 
                name="prioridad" 
                value={formData.prioridad} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8640A]/50 focus:border-[#E8640A] text-sm"
              >
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: ESTADO DE MATERIAL */}
        <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200">
            <h3 className="font-bold text-zinc-800 text-sm tracking-wide">2. ESTADO DE MATERIAL</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {estadosMaterial.map((estado) => (
                <label key={estado} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="radio" 
                      name="estado_material" 
                      value={estado} 
                      checked={formData.estado_material === estado}
                      onChange={handleInputChange}
                      className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-full checked:border-[#E8640A] checked:border-4 transition-all"
                    />
                  </div>
                  <span className={`text-sm ${formData.estado_material === estado ? 'text-zinc-900 font-medium' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                    {estado}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: RUTA PLANEADA DE PROCESO */}
        <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200 flex justify-between items-center">
            <h3 className="font-bold text-zinc-800 text-sm tracking-wide">3. RUTA PLANEADA DE PROCESO</h3>
            <button 
              type="button" 
              onClick={addProceso}
              className="text-xs flex items-center gap-1 font-medium text-[#E8640A] hover:text-[#d05809] bg-[#E8640A]/10 px-3 py-1.5 rounded"
            >
              <Plus size={14} /> Añadir OP
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">OP</th>
                  <th className="px-4 py-3">Proceso / Etapa</th>
                  <th className="px-4 py-3">Máquina Principal</th>
                  <th className="px-4 py-3">Máquina Alternativa</th>
                  <th className="px-4 py-3">Objetivo</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {procesos.map((p, index) => (
                  <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <td className="px-4 py-2 text-center font-medium text-zinc-900">{p.op}</td>
                    <td className="px-2 py-2">
                      <input type="text" value={p.proceso} onChange={(e) => handleProcesoChange(index, 'proceso', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-[#E8640A] rounded bg-transparent focus:bg-white focus:outline-none transition-colors" placeholder="Ej. Corte" required />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={p.maquinaPrincipal} onChange={(e) => handleProcesoChange(index, 'maquinaPrincipal', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-[#E8640A] rounded bg-transparent focus:bg-white focus:outline-none transition-colors" placeholder="Principal" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={p.maquinaAlternativa} onChange={(e) => handleProcesoChange(index, 'maquinaAlternativa', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-[#E8640A] rounded bg-transparent focus:bg-white focus:outline-none transition-colors" placeholder="Alternativa" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={p.objetivo} onChange={(e) => handleProcesoChange(index, 'objetivo', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-[#E8640A] rounded bg-transparent focus:bg-white focus:outline-none transition-colors" placeholder="Objetivo" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={p.responsable} onChange={(e) => handleProcesoChange(index, 'responsable', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-[#E8640A] rounded bg-transparent focus:bg-white focus:outline-none transition-colors" placeholder="Responsable" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        type="button" 
                        onClick={() => removeProceso(index)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        disabled={procesos.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 pb-12">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-zinc-300 text-zinc-700 rounded-md font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#E8640A] hover:bg-[#d05809] text-white px-8 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save size={18} />
            )}
            Guardar Tarjeta
          </button>
        </div>

      </form>
    </motion.div>
  );
}

function FormGroup({ label, name, type = "text", value, onChange, required, min }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8640A]/50 focus:border-[#E8640A] text-sm transition-shadow"
      />
    </div>
  );
}
