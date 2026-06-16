import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { reservationApi, Reservation } from '../api/reservation';
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  BookmarkX,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reservationApi.getMyReservations();
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError('No se pudo cargar tu historial de reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

    setActionLoadingId(id);
    setError('');

    try {
      await reservationApi.cancel(id);
      
      // Actualizar estado local
      setReservations((prev) =>
        prev.map((res) =>
          res.reservation_id === id ? { ...res, status: 'CANCELLED' } : res
        )
      );
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      setError(err.response?.data?.message || 'Error al intentar cancelar la reserva.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mapear filtros de estado
  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === 'ALL') return true;
    return res.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">Confirmada</span>;
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">Pendiente</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">Cancelada</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Page */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mis Reservas</h2>
        <p className="text-slate-500 text-sm mt-1">Monitorea y gestiona tus reservas de laboratorios actuales e históricas.</p>
      </div>

      {/* Barra de Filtros */}
      <Card className="p-4 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
          Filtrar por estado
        </span>
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto text-xs font-bold font-sans">
          {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-4 py-2 rounded-lg transition-all cursor-pointer flex-1 md:flex-none
                ${
                  statusFilter === status
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              {status === 'ALL' ? 'Todas' : status === 'CONFIRMED' ? 'Confirmadas' : status === 'PENDING' ? 'Pendientes' : 'Canceladas'}
            </button>
          ))}
        </div>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Historial de Reservas */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <Card key={res.reservation_id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                    {res.laboratory?.name || `Laboratorio #${res.lab_id}`}
                  </h3>
                  {getStatusBadge(res.status)}
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Motivo: <span className="text-slate-700">{res.purpose || 'No especificado'}</span>
                </p>
                {res.notes && (
                  <p className="text-xs text-slate-400 italic">
                    Notas: "{res.notes}"
                  </p>
                )}
              </div>

              {/* Fecha y Hora de la reserva */}
              <div className="flex gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  {new Date(res.start_time).toLocaleDateString('es-EC', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {new Date(res.start_time).toLocaleTimeString('es-EC', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(res.end_time).toLocaleTimeString('es-EC', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Botón de Cancelación */}
              <div className="w-full md:w-auto flex justify-end">
                {res.status !== 'CANCELLED' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-slate-200 w-full md:w-auto"
                    isLoading={actionLoadingId === res.reservation_id}
                    onClick={() => handleCancelReservation(res.reservation_id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic flex items-center gap-1 select-none">
                    <XCircle className="w-3.5 h-3.5" />
                    Reserva Cancelada
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center text-slate-400 border-dashed border-slate-200 bg-slate-50/20">
          <BookmarkX className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-sm">No registras reservas para este filtro.</p>
        </Card>
      )}
    </div>
  );
};
