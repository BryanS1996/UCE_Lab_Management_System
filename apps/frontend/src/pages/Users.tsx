import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { userApi, User } from '../api/user';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h2>
        <p className="text-slate-500 text-sm mt-1">Administra los roles y accesos de los usuarios del sistema.</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

