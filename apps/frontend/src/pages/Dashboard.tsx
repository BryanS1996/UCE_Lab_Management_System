import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { laboratoryApi, Laboratory } from '../api/laboratory';
import { reservationApi, Reservation } from '../api/reservation';
import {
  Building2,
  CalendarCheck,
  Activity,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Users,
  MapPin,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Trophy,
  TrendingUp,
  Award,
  ArrowUpRight
} from 'lucide-react';

const TIME_SLOTS = [
  { label: '07:00 - 09:00', start: '07:00', end: '09:00' },
  { label: '09:00 - 11:00', start: '09:00', end: '11:00' },
  { label: '11:00 - 13:00', start: '11:00', end: '13:00' },
  { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 - 18:00', start: '16:00', end: '18:00' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Data States
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [stats, setStats] = useState({ total: 24, active: 18, maintenance: 4, inactive: 2 });
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reservation Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedLabForBooking, setSelectedLabForBooking] = useState<Laboratory | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Carousel slider state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Admin Dashboard States
  const [adminStats, setAdminStats] = useState<{
    totalByPeriod: { day: number; week: number; month: number };
    topUsers: Array<{ email: string; count: number }>;
    topLaboratories: Array<{ name: string; count: number }>;
  } | null>(null);
  const [adminPeriod, setAdminPeriod] = useState<'day' | 'week' | 'month'>('week');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [labsData, myResData] = await Promise.all([
        laboratoryApi.getLaboratories(),
        reservationApi.getMyReservations(),
      ]);
      
      setLabs(labsData);
      setMyReservations(myResData);

      // Fetch stats if available, else fall back to local count
      try {
        const statsData = await laboratoryApi.getStats();
        setStats({
          total: statsData.total,
          active: statsData.active,
          maintenance: statsData.maintenance,
          inactive: statsData.inactive,
        });
      } catch (e) {
        // Fallback
        const total = labsData.length;
        const active = labsData.filter(l => l.status === 'ACTIVE').length;
        const maintenance = labsData.filter(l => l.status === 'MAINTENANCE').length;
        const inactive = labsData.filter(l => l.status === 'INACTIVE').length;
        setStats({ total, active, maintenance, inactive });
      }

      if (user?.role === 'ADMIN') {
        try {
          const statsDataAdmin = await reservationApi.getAdminStats();
          setAdminStats(statsDataAdmin);
        } catch (e) {
          console.error('Error fetching admin statistics:', e);
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Ocurrió un error al cargar la información del panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBooking = (lab: Laboratory) => {
    setSelectedLabForBooking(lab);
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
      // Unir la fecha seleccionada del calendario lateral con la hora ingresada
      const dateString = selectedDate.toISOString().split('T')[0];
      const startDateTime = new Date(`${dateString}T${startTime}`).toISOString();
      const endDateTime = new Date(`${dateString}T${endTime}`).toISOString();

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
      
      // Limpiar formulario
      setSelectedSlotIndex(null);
      setBookingPurpose('');
      setBookingNotes('');
      
      // Recargar datos
      fetchData();
      
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Error al procesar la reserva. Verifica los datos e inténtalo de nuevo.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtrar reservas del día seleccionado para el calendario lateral
  const getSelectedDayReservations = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return myReservations.filter((res) => {
      const resDateString = new Date(res.start_time).toISOString().split('T')[0];
      return resDateString === dateString;
    });
  };

  // Mapeo de estados en español con estilos
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-md font-bold">Confirmada</span>;
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] px-2 py-0.5 rounded-md font-bold">Pendiente</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2 py-0.5 rounded-md font-bold">Cancelada</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] px-2 py-0.5 rounded-md font-bold">{status}</span>;
    }
  };

  // Navegar carrusel de laboratorios
  const nextSlide = () => {
    if (labs.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % labs.length);
  };

  const prevSlide = () => {
    if (labs.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + labs.length) % labs.length);
  };

  // Calendario Helpers
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const days = [];
    const count = daysInMonth(selectedDate);
    const startDay = firstDayOfMonth(selectedDate);
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const today = new Date();

    // Rellenar días en blanco de la semana anterior
    const prevBlankDays = startDay === 0 ? 6 : startDay - 1;
    for (let i = 0; i < prevBlankDays; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Insertar días del mes
    for (let day = 1; day <= count; day++) {
      const dayDate = new Date(currentYear, currentMonth, day);
      const isSelected = selectedDate.getDate() === day;
      const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

      days.push(
        <button
          key={`day-${day}`}
          onClick={() => setSelectedDate(dayDate)}
          className={`
            h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer
            ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : ''}
            ${isToday && !isSelected ? 'border border-blue-600 text-blue-600' : ''}
            ${!isSelected && !isToday ? 'hover:bg-slate-100 text-slate-700' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(newDate);
  };

  if (user?.role === 'ADMIN') {
    const periodLabels = {
      day: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes'
    };

    const maxLabCount = adminStats && adminStats.topLaboratories.length > 0
      ? Math.max(...adminStats.topLaboratories.map(l => l.count))
      : 1;

    const maxPeriodCount = adminStats
      ? Math.max(adminStats.totalByPeriod.day, adminStats.totalByPeriod.week, adminStats.totalByPeriod.month, 1)
      : 1;

    return (
      <div className="space-y-6">
        {/* Header con Bienvenida */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-100 relative overflow-hidden">
          <div className="relative z-10 text-left">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Panel Administrativo</h1>
            <p className="text-indigo-200 text-sm mt-1">Bienvenido, {user.firstName} {user.lastName}. Gestión global de laboratorios y reservas.</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <Button
              variant="outline"
              className="border-indigo-500/30 text-white hover:bg-white/10 bg-white/5 rounded-2xl"
              onClick={fetchData}
            >
              Recargar Datos
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none select-none">
            <Building2 className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Métrica Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex items-center gap-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{labs.length}</span>
              <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Total laboratorios</p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {labs.filter(l => l.status === 'ACTIVE').length}
              </span>
              <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Laboratorios activos</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl"><CalendarCheck className="w-6 h-6" /></div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {adminStats?.totalByPeriod[adminPeriod] ?? 0}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-xs font-semibold text-slate-400 select-none">Reservas ({periodLabels[adminPeriod]})</p>
                <select
                  value={adminPeriod}
                  onChange={(e) => setAdminPeriod(e.target.value as any)}
                  className="text-[10px] bg-slate-100 text-slate-600 border-none rounded p-0.5 font-bold cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="day">Hoy</option>
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {labs.filter(l => l.status === 'MAINTENANCE').length}
              </span>
              <p className="text-xs font-semibold text-slate-400 mt-1 select-none">En mantenimiento</p>
            </div>
          </Card>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Gráficos de reservas y top labs (span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gráfico 1: Reservas por Período */}
            <Card className="p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6 text-left">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Reservas Totales por Período
                  </h2>
                  <p className="text-xs text-slate-400">Comparativa de solicitudes registradas en el sistema.</p>
                </div>
              </div>

              {adminStats ? (
                <div className="space-y-4">
                  {/* Fila Hoy */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700">Reservas de Hoy</span>
                      <span className="font-bold text-indigo-600">{adminStats.totalByPeriod.day}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(adminStats.totalByPeriod.day / maxPeriodCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fila Semana */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700">Reservas de esta Semana</span>
                      <span className="font-bold text-indigo-600">{adminStats.totalByPeriod.week}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(adminStats.totalByPeriod.week / maxPeriodCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fila Mes */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700">Reservas de este Mes</span>
                      <span className="font-bold text-indigo-600">{adminStats.totalByPeriod.month}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(adminStats.totalByPeriod.month / maxPeriodCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Cargando gráfico...</div>
              )}
            </Card>

            {/* Gráfico 2: Top 5 Labs */}
            <Card className="p-6 border border-slate-100">
              <div className="text-left mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Laboratorios Más Solicitados (Top 5)
                </h2>
                <p className="text-xs text-slate-400">Laboratorios con mayor volumen de reservas aprobadas y pendientes.</p>
              </div>

              {adminStats && adminStats.topLaboratories.length > 0 ? (
                <div className="space-y-4">
                  {adminStats.topLaboratories.map((lab, index) => {
                    const colors = [
                      'from-blue-500 to-indigo-600',
                      'from-emerald-500 to-teal-600',
                      'from-purple-500 to-indigo-600',
                      'from-orange-500 to-amber-600',
                      'from-pink-500 to-rose-600'
                    ];
                    const percentage = (lab.count / maxLabCount) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-black text-slate-500">
                              {index + 1}
                            </span>
                            {lab.name}
                          </span>
                          <span className="font-bold text-slate-900">{lab.count} {lab.count === 1 ? 'reserva' : 'reservas'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No hay datos de laboratorios reservados aún.</div>
              )}
            </Card>

          </div>

          {/* Columna Derecha: Top Users y Accesos (span 1) */}
          <div className="space-y-6">
            
            {/* Top 3 Users */}
            <Card className="p-6 border border-slate-100">
              <div className="text-left mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Usuarios Frecuentes (Top 3)
                </h2>
                <p className="text-xs text-slate-400">Estudiantes y docentes con más reservas registradas.</p>
              </div>

              {adminStats && adminStats.topUsers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {adminStats.topUsers.map((userStats, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const bgBadge = ['bg-amber-50 text-amber-700', 'bg-slate-50 text-slate-600', 'bg-orange-50 text-orange-700'];
                    return (
                      <div key={index} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-2xl">{medals[index]}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-800 break-all">{userStats.email}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Estudiante / Docente</p>
                          </div>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${bgBadge[index]}`}>
                          {userStats.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No hay registros de reservas aún.</div>
              )}
            </Card>

            {/* Accesos Rápidos */}
            <Card className="p-6 border border-slate-100">
              <div className="text-left mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider select-none">Accesos Rápidos</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/reservas'}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl group transition-all"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">Aprobación de Reservas</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aprobar o rechazar solicitudes</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <button
                  onClick={() => window.location.href = '/laboratorios'}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl group transition-all"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">Ver Laboratorios</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Monitorear estado de laboratorios</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </Card>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Métrica Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl"><Monitor className="w-6 h-6" /></div>
          <div className="text-left">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{stats.total}</span>
            <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Total laboratorios</p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl"><CalendarCheck className="w-6 h-6" /></div>
          <div className="text-left">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{myReservations.length}</span>
            <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Reservas programadas</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
          <div className="text-left">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{stats.active}</span>
            <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Laboratorios disponibles</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl"><BookmarkCheck className="w-6 h-6" /></div>
          <div className="text-left">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {myReservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-1 select-none">Mis Reservas activas</p>
          </div>
        </Card>
      </div>

      {/* 2. Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado izquierdo (Carrusel y Ocupación) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Carrusel de Laboratorios Disponibles */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Card.Title>Laboratorios Disponibles</Card.Title>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  className="p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : labs.length > 0 ? (
              <div className="relative overflow-hidden h-64 flex items-center">
                <div
                  className="w-full flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                >
                  {labs.map((lab) => (
                    <div key={lab.lab_id} className="w-full shrink-0 px-2">
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between h-56 text-left hover:border-blue-150 transition-colors">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-lg">{lab.name}</h4>
                              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {lab.location || 'Ubicación no especificada'}
                              </p>
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
                          <p className="text-xs text-slate-500 mt-3.5 line-clamp-2 leading-relaxed">
                            {lab.description || 'Sin descripción disponible.'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Monitor className="w-4 h-4 text-slate-400" />
                              Equipado
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-slate-400" />
                              Capacidad: {lab.max_capacity}
                            </span>
                          </div>
                          {lab.status === 'ACTIVE' && (
                            <Button size="sm" onClick={() => handleOpenBooking(lab)}>
                              Reservar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No hay laboratorios disponibles en este momento.
              </div>
            )}
          </Card>

          {/* Ocupación y Reservas Recientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ocupación Donut Chart (SVG) */}
            <Card className="p-6 text-left flex flex-col justify-between">
              <Card.Title>Ocupación de Laboratorios</Card.Title>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    {/* Ocupados (62%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#2563eb" strokeWidth="3"
                            strokeDasharray="62 38" strokeDashoffset="0" />
                    {/* Disponibles (25%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="3"
                            strokeDasharray="25 75" strokeDashoffset="-62" />
                    {/* Mantenimiento (8%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3"
                            strokeDasharray="8 92" strokeDashoffset="-87" />
                    {/* Fuera de servicio (5%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="3"
                            strokeDasharray="5 95" strokeDashoffset="-95" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">62%</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 select-none">Promedio</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0"></span>
                    <span className="truncate">Ocupados (62%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></span>
                    <span className="truncate">Disponibles (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0"></span>
                    <span className="truncate">Mantenimiento (8%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"></span>
                    <span className="truncate">Inactivo (5%)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reservas Recientes */}
            <Card className="p-6 text-left flex flex-col justify-between">
              <div>
                <Card.Title>Reservas Recientes</Card.Title>
                <div className="mt-4 space-y-3">
                  {myReservations.length > 0 ? (
                    myReservations.slice(0, 4).map((res) => (
                      <div key={res.reservation_id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {res.laboratory?.name || `Laboratorio #${res.lab_id}`}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(res.start_time).toLocaleDateString('es-EC')}
                          </p>
                        </div>
                        {getStatusBadge(res.status)}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No registras reservas recientes.
                    </div>
                  )}
                </div>
              </div>
            </Card>

          </div>

        </div>

        {/* Lado derecho: Calendario lateral */}
        <Card className="p-6 text-left flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header del Calendario */}
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900 tracking-tight select-none">Calendario</span>
              <div className="flex items-center gap-1 select-none">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-700 capitalize w-20 text-center">
                  {getMonthName(selectedDate)}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Grid Semanal */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'].map((d) => (
                <span key={d} className="font-extrabold text-slate-400 select-none">{d}</span>
              ))}
              {renderCalendarDays()}
            </div>

            {/* Eventos del día seleccionado */}
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <span className="text-xs font-extrabold text-slate-400 select-none">
                Reservas para el {selectedDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
              </span>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getSelectedDayReservations().length > 0 ? (
                  getSelectedDayReservations().map((res) => (
                    <div key={res.reservation_id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">
                          {res.laboratory?.name || `Laboratorio #${res.lab_id}`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {new Date(res.start_time).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_time).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {getStatusBadge(res.status)}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-[11px] border border-dashed border-slate-150 rounded-xl bg-slate-50/20">
                    No hay reservas programadas para este día.
                  </div>
                )}
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* 3. Formulario Modal de Reservas */}
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
          <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <p className="text-xs text-slate-500 font-medium">
              Ubicación: <span className="text-slate-700 font-semibold">{selectedLabForBooking?.location}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Fecha de Reserva: <span className="text-slate-700 font-semibold">{selectedDate.toLocaleDateString('es-EC')}</span>
            </p>

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
              placeholder="Ej: Práctica de Algoritmos, Examen"
              value={bookingPurpose}
              onChange={(e) => setBookingPurpose(e.target.value)}
              required
            />

            <div className="space-y-1.5">
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
