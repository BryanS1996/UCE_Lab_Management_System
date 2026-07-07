import React, { useState, useEffect } from 'react';
import { endpoints } from '../api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Search, RefreshCw, Terminal } from 'lucide-react';

export const Logs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res: any = await endpoints.logsList();
      if (res && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2">No tienes permisos para ver los logs del sistema.</p>
      </div>
    );
  }

  const filteredLogs = logs.filter(
    log => 
      log.correlationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-slate-800 rounded-xl">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            Logs del Sistema (Auditoría)
          </h1>
          <p className="text-slate-500 mt-1">
            Registro histórico de eventos asíncronos y transacciones en el sistema.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          Refrescar
        </button>
      </div>

      <div className="flex bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de correlación, tipo de evento o fuente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Evento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Correlation ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fuente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Cargando logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold text-xs border border-blue-100">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                      {log.correlationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {log.source || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="group relative inline-block">
                        <button className="text-blue-500 hover:text-blue-700 font-medium text-xs">
                          Ver Payload
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-80 bg-slate-800 text-emerald-400 text-xs font-mono p-3 rounded-lg shadow-xl text-left z-50">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
