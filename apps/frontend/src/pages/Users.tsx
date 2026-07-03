import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { userApi, User } from '../api/user';
import { ShieldAlert, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Polling para sincronización de usuarios en tiempo real
    const interval = setInterval(() => {
      fetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await userApi.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Error al cambiar rol');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await userApi.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await userApi.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roles: [formData.role],
      });
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-sm mt-1">Administra los roles y accesos de los usuarios del sistema.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Usuario</th>
                <th className="px-6 py-4 font-bold">Correo</th>
                <th className="px-6 py-4 font-bold">Rol Actual</th>
                <th className="px-6 py-4 font-bold">Cambiar Rol</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4 font-semibold">
                    {u.roles?.map(r => r.name).join(', ') || 'STUDENT'}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      value={u.roles?.[0]?.name || 'student'}
                    >
                      <option value="student">Estudiante</option>
                      <option value="professor">Docente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4"/> Activo</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-bold"><XCircle className="w-4 h-4"/> Inactivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-xs border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Usuario"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Juan"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Apellido"
              placeholder="Pérez"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <Input
            label="Correo Institucional"
            type="email"
            placeholder="jperez@uce.edu.ec"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Contraseña Temporal"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Rol</label>
            <select
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full p-3 transition-all"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Estudiante</option>
              <option value="professor">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

