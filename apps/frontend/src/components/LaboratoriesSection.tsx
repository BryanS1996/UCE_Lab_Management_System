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
        return (
          <svg className="w-12 h-12 text-uce-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'PHYSICS':
        return (
          <svg className="w-12 h-12 text-uce-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'CHEMISTRY':
        return (
          <svg className="w-12 h-12 text-uce-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-uce-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
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
    switch ((status || '').toUpperCase()) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laboratories.map((lab) => (
            <div key={lab.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-uce-light rounded-lg">
                  {getLabIcon(lab.type)}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lab.status)}`}>
                  {getStatusText(lab.status)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lab.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lab.description}</p>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uce-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{lab.location}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uce-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Cap: {lab.capacity}</span>
                </div>
              </div>
              <button
                onClick={() => handleReserve(lab)}
                disabled={(lab.status || '').toUpperCase() !== 'AVAILABLE'}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-uce-purple to-uce-blue text-white font-semibold rounded-lg hover:from-uce-blue hover:to-uce-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
