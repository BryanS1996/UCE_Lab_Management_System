import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { laboratoryApi, Laboratory } from '../api/laboratory';
import { reservationApi } from '../api/reservation';
import { useAuth } from '../context/AuthContext';
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
  CreditCard,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { endpoints } from '../api';

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

  // Admin State
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    description: '',
    location: '',
    max_capacity: 30,
    tier: 'BASIC',
  });

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
    // Inicializar fecha de reserva con la de mañana por defecto usando timezone local
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    setBookingDate(`${year}-${month}-${day}`);
    setSelectedSlotIndex(null);
    setIsBookingOpen(true);
    setBookingSuccess('');
    setError('');
  };

  const handleOpenAdminModal = (lab?: Laboratory) => {
    if (lab) {
      setEditingLab(lab);
      setAdminFormData({
        name: lab.name,
        description: lab.description || '',
        location: lab.location || '',
        max_capacity: lab.max_capacity,
        tier: lab.tier || 'BASIC',
      });
    } else {
      setEditingLab(null);
      setAdminFormData({
        name: '',
        description: '',
        location: '',
        max_capacity: 30,
        tier: 'BASIC',
      });
    }
    setIsAdminModalOpen(true);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await laboratoryApi.update(editingLab.lab_id, adminFormData);
      } else {
        await laboratoryApi.create(adminFormData);
      }
      setIsAdminModalOpen(false);
      fetchLaboratories();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar el laboratorio');
    }
  };

  const handleDeleteLab = async (labId: number) => {
    if (window.confirm('¿Estás seguro de eliminar este laboratorio?')) {
      try {
        await laboratoryApi.delete(labId);
        fetchLaboratories();
      } catch (err: any) {
        console.error(err);
        setError('Error al eliminar el laboratorio');
      }
    }
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

      const res = await reservationApi.create(bookingPayload);

      if (selectedLabForBooking.tier === 'PREMIUM') {
        setBookingSuccess('Redirigiendo al portal de pagos...');
        try {
          const paymentRes: any = await endpoints.paymentCheckoutSession(res.reservation_id, selectedLabForBooking.name);
          if (paymentRes && paymentRes.url) {
            window.location.href = paymentRes.url;
            return;
          } else {
            setError('No se pudo iniciar el pago. ' + (paymentRes?.error || ''));
          }
        } catch (paymentErr) {
          console.error('Error starting checkout session:', paymentErr);
          setBookingSuccess('');
          setError('Error al conectar con la pasarela de pago.');
        }
      } else {
        setBookingSuccess('¡Tu solicitud de reserva ha sido enviada exitosamente!');
        setSelectedSlotIndex(null);
        setBookingPurpose('');
        setBookingNotes('');
        
        setTimeout(() => {
          setIsBookingOpen(false);
          setBookingSuccess('');
        }, 2000);
      }
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

        {isAdmin && (
          <Button onClick={() => handleOpenAdminModal()} className="flex items-center gap-2 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Crear Lab
          </Button>
        )}

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
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                        {lab.name}
                      </h3>
                      {isAdmin && (
                        <div className="flex gap-1 ml-auto shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenAdminModal(lab); }} className="p-1.5 hover:bg-white rounded-md shadow-sm text-slate-500 hover:text-blue-600 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteLab(lab.lab_id); }} className="p-1.5 hover:bg-white rounded-md shadow-sm text-slate-500 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                    <span className={`w-fit text-[10px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                      lab.tier === 'PREMIUM'
                        ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border-amber-300 shadow-sm'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {lab.tier === 'PREMIUM' ? '✨ Premium' : 'Básico'}
                    </span>
                  </div>
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

              {!isAdmin && (
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
              )}
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
                className={`flex-1 py-3 ${selectedLabForBooking?.tier === 'PREMIUM' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {selectedLabForBooking?.tier === 'PREMIUM' ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2 inline" />
                    Pagar Reserva
                  </>
                ) : (
                  'Confirmar Reserva'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Admin CRUD Modal */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title={editingLab ? 'Editar Laboratorio' : 'Crear Laboratorio'}
      >
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <Input
            id="admin_name"
            label="Nombre del Laboratorio"
            value={adminFormData.name}
            onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
            required
          />
          <Input
            id="admin_location"
            label="Ubicación"
            value={adminFormData.location}
            onChange={(e) => setAdminFormData({ ...adminFormData, location: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                id="admin_capacity"
                type="number"
                label="Capacidad Máxima"
                value={adminFormData.max_capacity.toString()}
                onChange={(e) => setAdminFormData({ ...adminFormData, max_capacity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="flex-1 space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-700">Tipo (Tier)</label>
              <select
                className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={adminFormData.tier}
                onChange={(e) => setAdminFormData({ ...adminFormData, tier: e.target.value })}
              >
                <option value="BASIC">Básico</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700">Descripción</label>
            <textarea
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              rows={3}
              value={adminFormData.description}
              onChange={(e) => setAdminFormData({ ...adminFormData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAdminModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
