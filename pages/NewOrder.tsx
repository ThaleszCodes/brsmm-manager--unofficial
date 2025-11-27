import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices, saveOrder } from '../services/storage';
import { placeOrder, getBalance } from '../services/brsmm';
import { Service, Order } from '../types';
import { Send, Calculator, AlertTriangle, ArrowLeft, Wallet } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState<string>('...');

  useEffect(() => {
    getServices().then(setServices).catch(console.error);
    // Fetch balance to show user their funds before ordering
    getBalance()
        .then(res => setCurrentBalance(`${res.balance} ${res.currency}`))
        .catch(() => setCurrentBalance('Erro ao carregar'));
  }, []);

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Calculations
  const totalPrice = selectedService && typeof quantity === 'number'
    ? (quantity / 1000) * selectedService.price_per_1000
    : 0;

  const totalCost = selectedService && typeof quantity === 'number'
    ? (quantity / 1000) * selectedService.cost_per_1000
    : 0;

  const profit = totalPrice - totalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !quantity || typeof quantity !== 'number') return;

    setError('');
    setLoading(true);

    try {
      // 1. Call API
      const { orderId } = await placeOrder(selectedService.smm_service_id, link, quantity);

      // 2. Create Order Object
      const newOrder: Order = {
        id: uuidv4(),
        service_id: selectedService.id,
        client_link: link,
        quantity: quantity,
        brsmm_order_id: orderId,
        status: 'pending',
        total_cost: totalCost,
        total_price: totalPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 3. Save to DB
      await saveOrder(newOrder);

      // 4. Redirect
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || "Erro ao processar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-lg text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Novo Pedido</h1>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg border border-gray-800 flex items-center gap-2 text-sm">
            <Wallet size={16} className="text-green-500"/>
            <span className="text-gray-400">Saldo:</span>
            <span className="font-mono font-bold text-white">{currentBalance}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-xl border border-gray-800 shadow-lg space-y-6">
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Serviço</label>
              <select
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
              >
                <option value="">Selecione um serviço...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — (R$ {s.price_per_1000.toFixed(2)}/k)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Link do Cliente</label>
              <input
                type="text"
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="https://instagram.com/usuario"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Quantidade</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
                    min={selectedService?.min_quantity}
                    max={selectedService?.max_quantity}
                    required
                  />
               </div>
               <div className="flex flex-col justify-end pb-3">
                   {selectedService && (
                       <span className="text-xs text-gray-500">
                           Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity}
                       </span>
                   )}
               </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedService}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                loading 
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                  : 'bg-primary hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              {loading ? 'Enviando...' : (
                <>
                  <Send size={20} /> Enviar Pedido
                </>
              )}
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-surface p-6 rounded-xl border border-gray-800 sticky top-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Calculator size={20} className="text-primary" /> Resumo
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Serviço:</span>
                <span className="text-white font-medium text-right max-w-[150px] truncate">
                  {selectedService?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Preço / 1k:</span>
                <span className="text-white font-medium">
                  R$ {selectedService?.price_per_1000.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total a Cobrar:</span>
                <span className="text-2xl font-bold text-green-400">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              
               <div className="bg-background rounded p-3 text-xs text-gray-500 mt-4 space-y-1">
                 <div className="flex justify-between">
                     <span>Custo API:</span>
                     <span>R$ {totalCost.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-primary">
                     <span>Lucro Estimado:</span>
                     <span>R$ {profit.toFixed(2)}</span>
                 </div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;