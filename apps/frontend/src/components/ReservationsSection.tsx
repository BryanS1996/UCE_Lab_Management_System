import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
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

      await endpoints.reservationCreate({
        laboratoryId: Number(formData.laboratoryId),
        startTime: times.startTime,
        endTime: times.endTime,
        purpose: formData.purpose,
      });

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

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="reservations-section" className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-uce-navy">Mis Reservaciones</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm && onClearSelection) onClearSelection();
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-uce-blue rounded-md hover:bg-uce-purple transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nueva Reservación'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedLabName ? `Reservar: ${selectedLabName}` : 'Crear Nueva Reservación'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Laboratorio</label>
              <input
                type="number"
                min="1"
                value={formData.laboratoryId}
                onChange={(e) => setFormData({ ...formData, laboratoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bloque de Horario</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, slot: slot.label })}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                      formData.slot === slot.label
                        ? 'border-uce-purple bg-uce-purple text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-uce-blue'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propósito</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-uce-purple text-white rounded-md hover:bg-uce-blue transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Reservación'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Laboratorio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propósito
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay reservaciones
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.laboratoryName || reservation.laboratoryId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.endTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
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