import React, { useState, useEffect } from 'react';
import { endpoints } from '../../api';
import { laboratoryApi, LaboratoryResource } from '../../api/laboratory';
import { X, UploadCloud, AlertCircle } from 'lucide-react';

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [labId, setLabId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [labResources, setLabResources] = useState<LaboratoryResource[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch user's reservations to link the incident
      endpoints.reservationMy()
        .then((data: any) => {
          setReservations(data);
        })
        .catch(() => {
          setError('No se pudieron cargar las reservas.');
        });
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        setError('Máximo 5 archivos permitidos.');
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const handleReservationSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resId = e.target.value;
    setReservationId(resId);
    setResourceId('');
    setLabResources([]);

    const selectedRes = reservations.find(r => r.reservation_id === resId);
    if (selectedRes) {
      setLabId(selectedRes.lab_id);
      try {
        const resources = await laboratoryApi.getResources(selectedRes.lab_id);
        setLabResources(resources);
      } catch (err) {
        console.error('Failed to load resources for lab', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationId || !title || !description || !resourceId) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('user_id', userId);
      formData.append('lab_id', labId.toString());
      formData.append('reservation_id', reservationId);
      formData.append('resource_id', resourceId);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      await endpoints.incidentCreate(formData);
      
      // Cleanup & close
      setTitle('');
      setDescription('');
      setReservationId('');
      setLabId('');
      setResourceId('');
      setLabResources([]);
      setFiles([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || 'Ocurrió un error al enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-red-500 w-6 h-6" />
            Reportar Incidente
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Reserva Afectada <span className="text-red-400">*</span>
            </label>
            <select 
              value={reservationId}
              onChange={handleReservationSelect}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Selecciona una reserva...</option>
              {reservations.map(res => (
                <option key={res.reservation_id} value={res.reservation_id}>
                  Reserva en Lab #{res.lab_id} ({new Date(res.start_time).toLocaleDateString()}) - {res.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Equipo o Recurso Dañado <span className="text-red-400">*</span>
            </label>
            <select 
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              required
              disabled={!reservationId || labResources.length === 0}
            >
              <option value="">Selecciona el equipo...</option>
              {labResources.map(res => (
                <option key={res.resource_id} value={res.resource_id}>
                  {res.name} ({res.type})
                </option>
              ))}
            </select>
            {reservationId && labResources.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">Este laboratorio no tiene equipos registrados.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Título del Problema <span className="text-red-400">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Computadora #4 no enciende"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Descripción Detallada <span className="text-red-400">*</span>
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lo sucedido con el mayor detalle posible..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Evidencias (Fotos)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center transition-colors group">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-slate-400 group-hover:text-slate-300">
                  {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : 'Arrastra imágenes o haz clic para buscar'}
                </span>
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {files.map((f, idx) => (
                  <span key={idx} className="bg-slate-800 text-xs text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 truncate max-w-[150px]">
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Enviar Reporte'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
