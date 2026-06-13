import React, { useState, useEffect } from 'react';
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
}

const LaboratoriesSection: React.FC<LaboratoriesSectionProps> = ({ isAuthenticated }) => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

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
    setSelectedLab(lab);
    setShowReserveModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'OCCUPIED':
        return 'Ocupado';
      case 'MAINTENANCE':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-uce-navy">Catálogo de Laboratorios</h2>
        <button
          onClick={fetchLaboratories}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-uce-blue rounded-md hover:bg-uce-purple transition-colors disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {laboratories.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay laboratorios disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laboratories.map((lab) => (
            <div key={lab.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{lab.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lab.status)}`}>
                  {getStatusText(lab.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lab.description}</p>
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p><span className="font-medium">Ubicación:</span> {lab.location}</p>
                <p><span className="font-medium">Capacidad:</span> {lab.capacity} personas</p>
                <p><span className="font-medium">Tipo:</span> {lab.type}</p>
              </div>
              <button
                onClick={() => handleReserve(lab)}
                disabled={lab.status.toUpperCase() !== 'AVAILABLE'}
                className="w-full py-2 px-4 bg-uce-purple text-white rounded-md hover:bg-uce-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      )}

      {showReserveModal && selectedLab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-uce-navy mb-4">Reservar Laboratorio</h3>
            <p className="text-gray-700 mb-4">
              Estás reservando: <strong>{selectedLab.name}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Por favor, usa la sección de Reservaciones para completar tu reserva con los detalles de fecha y propósito.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReserveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowReserveModal(false);
                  // Scroll to reservations section
                  document.getElementById('reservations-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-uce-blue rounded-md hover:bg-uce-purple transition-colors"
              >
                Ir a Reservaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoriesSection;
