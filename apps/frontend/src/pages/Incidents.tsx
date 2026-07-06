import React, { useState, useEffect } from 'react';
import { endpoints } from '../api';
import { useAuth } from '../context/AuthContext';
import { IncidentFormModal } from '../components/incidents/IncidentFormModal';
import { AlertTriangle, Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, DownloadCloud } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { startOfWeek, startOfMonth, parseISO } from 'date-fns';

export const Incidents: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');

  const isAdminOrManager = user?.role === 'ADMIN';

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // For Admin/Manager, fetch all. For student/teacher, the API should ideally filter by user_id
      // For now, we fetch all and filter in frontend if the API doesn't support it yet
      const data: any = await endpoints.incidentList();
      if (isAdminOrManager) {
        setIncidents(data);
      } else {
        setIncidents(data.filter((inc: any) => inc.user_id === user?.id));
      }
    } catch (err) {
      console.error('Error fetching incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Polling para sincronización de incidentes en tiempo real
    const interval = setInterval(() => {
      fetchIncidents();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (timeFilter === 'ALL') return true;
    
    const incidentDate = new Date(inc.created_at);
    if (timeFilter === 'WEEK') {
      return incidentDate >= startOfWeek(new Date());
    }
    if (timeFilter === 'MONTH') {
      return incidentDate >= startOfMonth(new Date());
    }
    
    return true;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138); // slate-900 or blue-900
    doc.text('Reporte de Incidencias en Equipos', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filtro aplicado: ${timeFilter === 'WEEK' ? 'Esta Semana' : timeFilter === 'MONTH' ? 'Este Mes' : 'Histórico Completo'}`, 14, 36);

    const tableColumn = ["Fecha", "Laboratorio", "Estado", "Título", "Descripción"];
    const tableRows: any[] = [];

    filteredIncidents.forEach(inc => {
      const rowData = [
        new Date(inc.created_at).toLocaleDateString(),
        `Lab #${inc.lab_id}`,
        inc.status || 'OPEN',
        inc.title,
        inc.description.length > 50 ? inc.description.substring(0, 50) + '...' : inc.description
      ];
      tableRows.push(rowData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    });

    doc.save(`Reporte_Incidencias_${timeFilter}_${new Date().getTime()}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            {isAdminOrManager ? 'Gestión de Incidentes' : 'Mis Reportes de Incidentes'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdminOrManager 
              ? 'Administra los reportes de problemas en todos los laboratorios.' 
              : 'Reporta daños o problemas ocurridos durante tus reservas.'}
          </p>
        </div>
        
        {!isAdminOrManager ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Reportar Incidente
          </button>
        ) : (
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <DownloadCloud className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar incidentes por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as any)}
          className="flex-shrink-0 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
        >
          <option value="ALL">Todo el Historial</option>
          <option value="MONTH">Este Mes</option>
          <option value="WEEK">Esta Semana</option>
        </select>
      </div>

      {/* Grid de Incidentes */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Cargando incidentes...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold">No se encontraron incidentes</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              Aún no hay reportes registrados o la búsqueda no arrojó resultados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIncidents.map((inc) => (
              <div 
                key={inc._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full -z-0 pointer-events-none" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${getStatusColor(inc.status || 'OPEN')}`}>
                    {getStatusIcon(inc.status || 'OPEN')}
                    {inc.status || 'OPEN'}
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    {new Date(inc.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2 relative z-10 line-clamp-1">{inc.title}</h3>
                <p className="text-slate-500 text-sm mb-5 flex-1 line-clamp-3 relative z-10">
                  {inc.description}
                </p>

                {/* Info Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 relative z-10">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">Lab #{inc.lab_id}</span>
                    <span>Ref: {inc.reservation_id?.substring(0,8) || 'N/A'}</span>
                  </div>
                  
                  {/* Evidencias count */}
                  {inc.evidence_urls && inc.evidence_urls.length > 0 && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {inc.evidence_urls.length} adjunto(s)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IncidentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchIncidents}
        userId={user?.id || ''}
      />
    </div>
  );
};
