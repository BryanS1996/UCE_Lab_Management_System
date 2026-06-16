import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { laboratoryApi, Laboratory } from '../api/laboratory';
import { reservationApi } from '../api/reservation';
import {
  Search,
  MapPin,
  Users,
  Monitor,
  Video,
  Projector,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

const TIME_SLOTS = [
  { label: '07:00 - 09:00', start: '07:00', end: '09:00' },
  { label: '09:00 - 11:00', start: '09:00', end: '11:00' },
  { label: '11:00 - 13:00', start: '11:00', end: '13:00' },
  { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 - 18:00', start: '16:00', end: '18:00' },
];

export const Laboratories: React.FC = () => {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ALL');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedLabForBooking, setSelectedLabForBooking] = useState<Laboratory | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchLaboratories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await laboratoryApi.getLaboratories();
      setLabs(data);
    } catch (err: any) {
      console.error('Error fetching laboratories:', err);
      setError('No se pudo cargar la lista de laboratorios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const handleOpenBooking = (lab: Laboratory) => {
    setSelectedLabForBooking(lab);
    // Inicializar fecha de reserva con la de mañana por defecto
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setSelectedSlotIndex(null);
    setIsBookingOpen(true);
    setBookingSuccess('');
    setError('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabForBooking) return;

    if (selectedSlotIndex === null) {
      setError('Por favor, selecciona un bloque de horario.');
      return;
    }

    const slot = TIME_SLOTS[selectedSlotIndex];
    const startTime = slot.start;
    const endTime = slot.end;

    setBookingLoading(true);
    setBookingSuccess('');
    setError('');

    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${bookingDate}T${endTime}`).toISOString();

      const bookingPayload: any = {
        lab_id: selectedLabForBooking.lab_id,
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: bookingPurpose.trim(),
      };

      if (bookingNotes.trim()) {
        bookingPayload.notes = bookingNotes.trim();
      }

      await reservationApi.create(bookingPayload);

      setBookingSuccess('¡Tu solicitud de reserva ha sido enviada exitosamente!');
      
      setSelectedSlotIndex(null);
      setBookingPurpose('');
      setBookingNotes('');
      
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Error al procesar la reserva. Verifica los datos.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtrado de Laboratorios
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.location && lab.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || lab.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Page */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Laboratorios</h2>
        <p className="text-slate-500 text-sm mt-1">Explora los laboratorios disponibles en la facultad y realiza reservas.</p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <Input
            placeholder="Buscar por nombre o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="py-2.5"
          />
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto text-xs font-bold font-sans">
          {(['ALL', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'] as const).map((status) => (
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
              {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Disponibles' : status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactivos'}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid de Laboratorios */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-500 border-red-50">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="font-semibold">{error}</p>
        </Card>
      ) : filteredLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <Card key={lab.lab_id} className="p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[70%]">
                    {lab.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    lab.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : lab.status === 'MAINTENANCE'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {lab.status === 'ACTIVE' ? 'Disponible' : lab.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {lab.location || 'Sin ubicación especificada'}
                </p>

                <p className="text-xs text-slate-500 leading-relaxed min-h-12 line-clamp-3">
                  {lab.description || 'Sin descripción detallada.'}
                </p>

                {/* Recursos y Capacidad */}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-55 text-xs text-slate-600 select-none">
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    <Users className="w-4 h-4 text-slate-400" />
                    Capacidad: {lab.max_capacity}
                  </span>
                  
                  {/* Mock resources representation based on database schema logic */}
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    <Monitor className="w-4 h-4 text-slate-400" />
                    PCs disponibles
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex">
                {lab.status === 'ACTIVE' ? (
                  <Button
                    variant="primary"
                    onClick={() => handleOpenBooking(lab)}
                    className="w-full py-2.5"
                  >
                    Reservar Laboratorio
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full py-2.5"
                  >
                    No Disponible
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-400 border-dashed border-slate-200 bg-slate-50/20">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3" />
          <p className="font-semibold text-sm">No se encontraron laboratorios con los criterios seleccionados.</p>
        </Card>
      )}

      {/* Booking Form Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={`Reservar ${selectedLabForBooking?.name}`}
      >
        {bookingSuccess ? (
          <div className="text-center py-6 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce mb-3" />
            <p className="text-slate-800 font-bold">{bookingSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <p className="text-xs text-slate-500 font-medium">
              Ubicación: <span className="text-slate-700 font-semibold">{selectedLabForBooking?.location}</span>
            </p>

            <Input
              id="booking_date"
              type="date"
              label="Fecha de Reserva"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />

            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold text-slate-700">
                Horario Disponible (Bloques Fijos)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedSlotIndex(index);
                      setError('');
                    }}
                    className={`
                      py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center
                      ${
                        selectedSlotIndex === index
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }
                    `}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="purpose"
              label="Motivo de la Reserva"
              placeholder="Ej: Clase de Algoritmos, Examen"
              value={bookingPurpose}
              onChange={(e) => setBookingPurpose(e.target.value)}
              required
            />

            <div className="space-y-1.5 text-left">
              <label htmlFor="notes" className="block text-xs font-semibold text-slate-700">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notes"
                placeholder="Indique recursos especiales requeridos, etc."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={3}
                className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingOpen(false)}
                className="flex-1 py-3"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={bookingLoading}
                className="flex-1 py-3"
              >
                Confirmar Reserva
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
