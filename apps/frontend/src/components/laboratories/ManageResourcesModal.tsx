import React, { useState, useEffect } from 'react';
import { laboratoryApi, LaboratoryResource, Laboratory } from '../../api/laboratory';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Package, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Wrench
} from 'lucide-react';

interface ManageResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  laboratory: Laboratory | null;
}

export const ManageResourcesModal: React.FC<ManageResourcesModalProps> = ({
  isOpen,
  onClose,
  laboratory,
}) => {
  const [resources, setResources] = useState<LaboratoryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'COMPUTER' | 'PROJECTOR' | 'WHITEBOARD' | 'EQUIPMENT' | 'SOFTWARE' | 'OTHER'>('COMPUTER');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (isOpen && laboratory) {
      fetchResources();
      resetForm();
    }
  }, [isOpen, laboratory]);

  const fetchResources = async () => {
    if (!laboratory) return;
    setLoading(true);
    try {
      const data = await laboratoryApi.getResources(laboratory.lab_id);
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setType('COMPUTER');
    setDescription('');
    setQuantity(1);
    setIsAvailable(true);
    setError('');
  };

  const handleEditClick = (res: LaboratoryResource) => {
    setIsEditing(true);
    setCurrentId(res.resource_id);
    setName(res.name);
    setType(res.type);
    setDescription(res.description || '');
    setQuantity(res.quantity);
    setIsAvailable(res.is_available);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este recurso?')) return;
    if (!laboratory) return;
    
    try {
      await laboratoryApi.deleteResource(laboratory.lab_id, id);
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('No se pudo eliminar el recurso.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laboratory) return;
    
    try {
      const payload = {
        name,
        type,
        description,
        quantity,
        is_available: isAvailable,
      };

      if (isEditing && currentId) {
        await laboratoryApi.updateResource(laboratory.lab_id, currentId, payload);
      } else {
        await laboratoryApi.createResource(laboratory.lab_id, payload);
      }
      
      fetchResources();
      resetForm();
    } catch (err) {
      console.error('Error saving resource:', err);
      setError('Error al guardar el recurso.');
    }
  };

  if (!isOpen || !laboratory) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Inventario: ${laboratory.name}`}>
      <div className="space-y-6">
        
        {/* Lista de Recursos Actuales */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" /> 
            Equipos Registrados
          </h3>
          
          {loading ? (
            <p className="text-center text-sm text-slate-500 py-4">Cargando...</p>
          ) : resources.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-4 border border-dashed border-slate-300 rounded-lg">
              No hay equipos registrados en este laboratorio.
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {resources.map((res) => (
                <div key={res.resource_id} className="flex items-center justify-between bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{res.name}</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">
                        x{res.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{res.type} {res.description ? `- ${res.description}` : ''}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {res.is_available ? (
                         <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3"/> Disponible</span>
                      ) : (
                         <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md"><Wrench className="w-3 h-3"/> Mantenimiento</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditClick(res)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(res.resource_id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {isEditing ? <Edit className="w-5 h-5 text-amber-500"/> : <Plus className="w-5 h-5 text-emerald-500"/>}
            {isEditing ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}
          </h3>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                placeholder="Ej. Microscopio Optico / PC-01"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
              >
                <option value="COMPUTER">Computadora</option>
                <option value="PROJECTOR">Proyector</option>
                <option value="WHITEBOARD">Pizarra</option>
                <option value="EQUIPMENT">Equipo de Lab</option>
                <option value="SOFTWARE">Software</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Cantidad</label>
              <input 
                required 
                type="number" 
                min="1"
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                placeholder="Opcional..."
              />
            </div>

            <div className="col-span-2 flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Estado del Equipo</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-bold ${isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isAvailable ? 'Disponible' : 'En Mantenimiento'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar Edición
              </Button>
            )}
            <Button type="submit" variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {isEditing ? 'Guardar Cambios' : 'Agregar Equipo'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
