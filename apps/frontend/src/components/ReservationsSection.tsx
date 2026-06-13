import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Building2 } from 'lucide-react';
import { endpoints } from '../api';

interface Reservation {
  id: string;
  laboratoryId: string;
  laboratoryName?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

interface Laboratory {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  type: string;
  status: string;
}

interface ReservationsSectionProps {
  isAuthenticated: boolean;
  selectedLabId?: string;
  selectedLabName?: string;
  onClearSelection?: () => void;
}

const TIME_SLOTS = [
  { label: '07:00 - 09:00', start: '07:00', end: '09:00' },
  { label: '09:00 - 11:00', start: '09:00', end: '11:00' },
  { label: '11:00 - 13:00', start: '11:00', end: '13:00' },
  { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 - 18:00', start: '16:00', end: '18:00' },
];

const ReservationsSection: React.FC<ReservationsSectionProps> = ({ 
  isAuthenticated, 
  selectedLabId, 
  selectedLabName,
  onClearSelection 
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    laboratoryId: selectedLabId || '',
    date: '',
    slot: '',
    purpose: '',
  });

  // Update laboratoryId when selectedLabId changes
  useEffect(() => {
    if (selectedLabId) {
      setFormData(prev => ({ ...prev, laboratoryId: selectedLabId }));
      setShowForm(true);
    }
  }, [selectedLabId]);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await endpoints.reservationMy() as Reservation[];
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchLaboratories = async () => {
    try {
      const data = await endpoints.laboratoryList() as Laboratory[];
      setLaboratories(data);
    } catch (err: any) {
      console.error('Error al cargar laboratorios:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
      fetchLaboratories();
    }
  }, [isAuthenticated]);

  const combineDateAndSlot = (date: string, slot: string) => {
    const selectedSlot = TIME_SLOTS.find(s => s.label === slot);
    if (!selectedSlot) return null;

    const [startHour, startMin] = selectedSlot.start.split(':').map(Number);
    const [endHour, endMin] = selectedSlot.end.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMin, 0, 0);

    return {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const times = combineDateAndSlot(formData.date, formData.slot);
      if (!times) {
        setError('Por favor selecciona un horario válido');
        setLoading(false);
        return;
      }

      // 1. Convertimos el ID a un número entero seguro
      const finalLabId = parseInt(String(formData.laboratoryId), 10);

      // 2. Verificamos que no sea NaN y que sea mayor a 0 para que NestJS no explote
      if (isNaN(finalLabId) || finalLabId < 1) {
        setError('Por favor selecciona un laboratorio válido de la lista.');
        setLoading(false);
        return;
      }

      const payload = {
        lab_id: finalLabId,
        start_time: times.startTime,
        end_time: times.endTime,
        purpose: formData.purpose,
      };

      console.log("🕵️ Payload exacto que sale de React:", payload);

      await endpoints.reservationCreate(payload);

      setShowForm(false);
      setFormData({ laboratoryId: '', date: '', slot: '', purpose: '' });
      if (onClearSelection) onClearSelection();
      fetchReservations();
    } catch (err: any) {
      setError(err.message || 'Error al crear reservación');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'CONFIRMED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Confirmada
        </span>
      );
    }
    if (statusUpper === 'PENDING') {
      return (
        <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pendiente
        </span>
      );
    }
    if (statusUpper === 'CANCELLED') {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Cancelada
        </span>
      );
    }
    if (statusUpper === 'COMPLETED') {
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completada
        </span>
      );
    }
    return (
      <span className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
        {status || 'Desconocido'}
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="reservations-section" className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Reservaciones</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus reservas de laboratorios</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm && onClearSelection) onClearSelection();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          {showForm ? (
            <>
              <XCircle className="w-4 h-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Nueva Reservación
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedLabName ? `Reservar: ${selectedLabName}` : 'Crear Nueva Reservación'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Laboratorio
              </label>
              <select
                value={formData.laboratoryId}
                onChange={(e) => setFormData({ ...formData, laboratoryId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              >
                <option value="">Selecciona un laboratorio</option>
                {laboratories
                  .filter((lab) => (lab.status || '').toUpperCase() === 'ACTIVE' || (lab.status || '').toUpperCase() === 'AVAILABLE')
                  .map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name} - {lab.location}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Bloque de Horario
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, slot: slot.label })}
                    className={`px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      formData.slot === slot.label
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Propósito</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl px-4 py-3 transition-all resize-none"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg rounded-xl px-5 py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Reservación'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Laboratorio
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Propósito
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay reservaciones</p>
                  <p className="text-sm mt-1">Crea tu primera reservación para comenzar</p>
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.laboratoryName || reservation.laboratoryId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{new Date(reservation.startTime).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      hasta {new Date(reservation.endTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsSection;