import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, getServices } from '../services/storage';
import { checkOrderStatus } from '../services/brsmm';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, Service } from '../types';
import { RefreshCw, Search, ExternalLink } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => {
    try {
        const [o, s] = await Promise.all([getOrders(), getServices()]);
        setOrders(o);
        setServices(s);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleCheckStatus = async (order: Order) => {
    setLoadingId(order.id);
    try {
      const result = await checkOrderStatus(order.brsmm_order_id);
      
      // Update logic based on API return
      // API usually returns status in lowercase English
      await updateOrderStatus(order.id, {
        status: result.status as any,
        start_count: result.start_count,
        remains: result.remains
      });
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update status", error);
      // Optional: Don't mark as error in DB if just a transient network fail, but UI can show error
      // updateOrderStatus(order.id, { status: 'error' }); 
    } finally {
      setLoadingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.brsmm_order_id.includes(searchTerm) || 
    o.client_link.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Gerenciar Pedidos</h1>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar ID ou Link..."
            className="w-full bg-surface border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">ID (BRSMM)</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Link</th>
                <th className="px-6 py-4 text-center">Progresso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Carregando pedidos...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const serviceName = services.find(s => s.id === order.service_id)?.name || '...';
                  const isUpdating = loadingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">
                        <span className="bg-gray-800 px-2 py-1 rounded">#{order.brsmm_order_id}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate">
                        {serviceName}
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate">
                        <a href={order.client_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                           {order.client_link} <ExternalLink size={12}/>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-white">{order.quantity}</span>
                            {order.remains && (
                                <span className="text-xs text-gray-500">Restam: {order.remains}</span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCheckStatus(order)}
                          disabled={isUpdating}
                          className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded transition-all"
                          title="Atualizar Status"
                        >
                          <RefreshCw size={18} className={isUpdating ? 'animate-spin text-primary' : ''} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;