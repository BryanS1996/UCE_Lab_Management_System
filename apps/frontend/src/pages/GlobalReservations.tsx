import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { reservationApi, Reservation } from '../api/reservation';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  ClipboardList
} from 'lucide-react';

export const GlobalReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all reservations. Filters are applied client-side or we can fetch them all.
      const data = await reservationApi.getAllReservations();
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching global reservations:', err);
      setError('No se pudo cargar el listado de reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleConfirm = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas APROBAR esta reserva?')) return;
    setActionLoadingId(id);
    try {
      await reservationApi.confirm(id);
      // Update local state status
      setReservations(prev =>
        prev.map(r => (r.reservation_id === id ? { ...r, status: 'CONFIRMED' } : r))
      );
    } catch (err: any) {
      console.error('Error confirming reservation:', err);
      alert('Error al confirmar la reserva.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas RECHAZAR esta reserva?')) return;
    setActionLoadingId(id);
    try {
      await reservationApi.reject(id);
      // Update local state status
      setReservations(prev =>
        prev.map(r => (r.reservation_id === id ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch (err: any) {
      console.error('Error rejecting reservation:', err);
      alert('Error al rechazar la reserva.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIRMADA
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            RECHAZADA / CANCELADA
          </span>
        );
      case 'PENDING':
        default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            PENDIENTE
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-EC', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Gestión Global de Reservas
          </h1>
          <p className="text-slate-400 text-xs mt-1">Aprobación y control de solicitudes de laboratorios institucionales.</p>
        </div>
        <Button
          onClick={fetchReservations}
          variant="outline"
          className="flex items-center gap-2 rounded-2xl self-start md:self-auto border-slate-200 text-slate-700"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2.5 text-left">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          }`}
        >
          Todas ({reservations.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          }`}
        >
          Pendientes ({reservations.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilterStatus('CONFIRMED')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'CONFIRMED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          }`}
        >
          Confirmadas ({reservations.filter(r => r.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setFilterStatus('CANCELLED')}
          className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'CANCELLED'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          }`}
        >
          Rechazadas/Canceladas ({reservations.filter(r => r.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Listado principal */}
      <Card className="border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Cargando reservas del sistema...</span>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-rose-500 gap-3">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Calendar className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-semibold">No se encontraron reservas con este filtro.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-[10px] font-black uppercase tracking-wider select-none border-b border-slate-100">
                  <th className="py-4 px-6">Usuario</th>
                  <th className="py-4 px-6">Laboratorio</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6">Horario</th>
                  <th className="py-4 px-6">Propósito / Notas</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredReservations.map((res) => {
                  const isPending = res.status === 'PENDING';
                  const isActionLoading = actionLoadingId === res.reservation_id;

                  return (
                    <tr key={res.reservation_id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Usuario */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase select-none">
                            {res.user_id.substring(0, 2)}
                          </div>
                          <div>
                            {/* Si no guardó user_email, usar fallback */}
                            <span className="font-bold text-slate-800 break-all">
                              {(res as any).user_email || 'estudiante@uce.edu.ec'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Laboratorio */}
                      <td className="py-4.5 px-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {res.laboratory?.name || `Laboratorio ID ${res.lab_id}`}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-4.5 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(res.start_time)}
                        </div>
                      </td>

                      {/* Horario */}
                      <td className="py-4.5 px-6 text-slate-700 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatTime(res.start_time)} - {formatTime(res.end_time)}
                        </div>
                      </td>

                      {/* Propósito / Notas */}
                      <td className="py-4.5 px-6 text-slate-600 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{res.purpose || 'Sin motivo'}</p>
                        {res.notes && <p className="text-xs text-slate-400 mt-0.5 truncate italic">"{res.notes}"</p>}
                      </td>

                      {/* Estado */}
                      <td className="py-4.5 px-6">
                        {getStatusBadge(res.status)}
                      </td>

                      {/* Acciones */}
                      <td className="py-4.5 px-6 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleConfirm(res.reservation_id)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleReject(res.reservation_id)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold select-none">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
