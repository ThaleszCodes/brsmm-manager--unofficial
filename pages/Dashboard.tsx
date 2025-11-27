import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Copy, ArrowRight, DollarSign } from 'lucide-react';
import { getOrders, getServices } from '../services/storage';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, Service } from '../types';
import { getBalance } from '../services/brsmm';

const Dashboard: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [balance, setBalance] = useState<string>('---');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, servicesData] = await Promise.all([
            getOrders(),
            getServices()
        ]);
        setRecentOrders(ordersData.slice(0, 10)); // Top 10
        setServices(servicesData);
        
        // Try fetch balance (silently fail if key invalid)
        getBalance()
            .then(res => setBalance(`${res.balance} ${res.currency}`))
            .catch(() => {});
            
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Painel Principal</h1>
            <p className="text-gray-400 mt-1">Bem vindo de volta, Admin.</p>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg border border-gray-800 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500"/>
            <span className="text-sm text-gray-400">Saldo BRSMM:</span>
            <span className="font-mono font-bold text-white">{balance}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/new-order" className="bg-surface p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <PlusCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Criar Pedido</h3>
          <p className="text-gray-400 text-sm mt-2">Novo serviço para cliente</p>
        </Link>

        <Link to="/orders" className="bg-surface p-6 rounded-xl border border-gray-800 hover:border-purple-500 transition-colors group">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500 mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Consultar Status</h3>
          <p className="text-gray-400 text-sm mt-2">Verificar andamento</p>
        </Link>

        <Link to="/copies" className="bg-surface p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-colors group">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <Copy size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Copys Rápidas</h3>
          <p className="text-gray-400 text-sm mt-2">Modelos de mensagem</p>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Últimos Pedidos</h3>
          <Link to="/orders" className="text-primary text-sm hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Link</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum pedido recente.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const serviceName = services.find(s => s.id === order.service_id)?.name || 'Serviço Removido';
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">#{order.brsmm_order_id}</td>
                      <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate" title={serviceName}>{serviceName}</td>
                      <td className="px-6 py-4 max-w-[150px] truncate" title={order.client_link}>{order.client_link}</td>
                      <td className="px-6 py-4">{order.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-300'}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">R$ {order.total_price?.toFixed(2)}</td>
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

export default Dashboard;