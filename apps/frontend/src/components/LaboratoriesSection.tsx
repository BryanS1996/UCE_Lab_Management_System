import React, { useState, useEffect } from 'react';
import { Monitor, Microscope, MapPin, Users, RefreshCw } from 'lucide-react';
import { endpoints } from '../api';

interface Laboratory {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  type: string;
  status: string;
}

interface LaboratoriesSectionProps {
  isAuthenticated: boolean;
  onReserveLab?: (labId: string, labName: string) => void;
}

const LaboratoriesSection: React.FC<LaboratoriesSectionProps> = ({ isAuthenticated, onReserveLab }) => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLaboratories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await endpoints.laboratoryList() as Laboratory[];
      setLaboratories(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar laboratorios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLaboratories();
    }
  }, [isAuthenticated]);

  const handleReserve = (lab: Laboratory) => {
    if (onReserveLab) {
      onReserveLab(lab.id, lab.name);
    }
  };

  const getLabIcon = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'COMPUTER':
        return <Monitor className="w-6 h-6 text-blue-600" />;
      case 'PHYSICS':
        return <Microscope className="w-6 h-6 text-purple-600" />;
      case 'CHEMISTRY':
        return <Microscope className="w-6 h-6 text-blue-600" />;
      default:
        return <Monitor className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'AVAILABLE' || statusUpper === 'ACTIVE') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Disponible
        </span>
      );
    }
    if (statusUpper === 'OCCUPIED') {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          Ocupado
        </span>
      );
    }
    if (statusUpper === 'MAINTENANCE') {
      return (
        <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
          Mantenimiento
        </span>
      );
    }
    return (
      <span className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
        {status || 'Desconocido'}
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Laboratorios</h2>
          <p className="text-sm text-gray-500 mt-1">Explora y reserva los laboratorios disponibles</p>
        </div>
        <button
          onClick={fetchLaboratories}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {laboratories.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">
          <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay laboratorios disponibles</p>
          <p className="text-sm mt-1">Intenta actualizar la lista más tarde</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laboratories.map((lab) => (
            <div
              key={lab.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {getLabIcon(lab.type)}
                </div>
                {getStatusBadge(lab.status)}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lab.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lab.description}</p>
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{lab.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Capacidad: {lab.capacity} personas</span>
                </div>
              </div>
              <button
                onClick={() => handleReserve(lab)}
                disabled={(lab.status || '').toUpperCase() !== 'AVAILABLE' && (lab.status || '').toUpperCase() !== 'ACTIVE'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg rounded-xl px-5 py-2.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaboratoriesSection;
