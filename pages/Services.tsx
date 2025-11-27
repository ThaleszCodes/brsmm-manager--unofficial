import React, { useState, useEffect } from 'react';
import { getServices, saveService, deleteService, getSettings } from '../services/storage';
import { Service } from '../types';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({});
  const [settings, setSettingsData] = useState<any>(null);
  
  const refreshServices = () => getServices().then(setServices);

  useEffect(() => {
    refreshServices();
    getSettings().then(setSettingsData);
  }, []);

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentService({
        cost_per_1000: 0,
        price_per_1000: 0,
        min_quantity: 100,
        max_quantity: 10000,
        category: 'Geral'
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      await deleteService(id);
      refreshServices();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService.name || !currentService.smm_service_id) return;

    const serviceToSave: Service = {
        id: currentService.id || uuidv4(),
        name: currentService.name!,
        description: currentService.description || '',
        smm_service_id: currentService.smm_service_id!,
        cost_per_1000: Number(currentService.cost_per_1000),
        price_per_1000: Number(currentService.price_per_1000),
        min_quantity: Number(currentService.min_quantity),
        max_quantity: Number(currentService.max_quantity),
        category: currentService.category || 'Geral'
    };

    await saveService(serviceToSave);
    refreshServices();
    setIsEditing(false);
  };

  // Auto calculate resell price helper
  const calculateResell = () => {
      const cost = Number(currentService.cost_per_1000 || 0);
      const margin = settings?.profit_margin_percent || 30;
      const price = cost + (cost * (margin / 100));
      setCurrentService({...currentService, price_per_1000: parseFloat(price.toFixed(2))});
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Serviços</h1>
        <button onClick={handleNew} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-2xl rounded-xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{currentService.id ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm text-gray-400">Nome do Serviço</label>
                        <input className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.name || ''} 
                            onChange={e => setCurrentService({...currentService, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">ID no BRSMM</label>
                        <input className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.smm_service_id || ''} 
                            onChange={e => setCurrentService({...currentService, smm_service_id: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Categoria</label>
                        <input className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.category || ''} 
                            onChange={e => setCurrentService({...currentService, category: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-gray-400">Descrição</label>
                        <textarea className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.description || ''} 
                            onChange={e => setCurrentService({...currentService, description: e.target.value})} />
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400">Custo / 1k (R$)</label>
                            <input type="number" step="0.01" className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                                value={currentService.cost_per_1000 || 0} 
                                onChange={e => setCurrentService({...currentService, cost_per_1000: parseFloat(e.target.value)})} 
                                onBlur={calculateResell}
                                />
                        </div>
                        <div>
                            <label className="text-sm text-green-400 font-bold">Revenda / 1k (R$)</label>
                            <input type="number" step="0.01" className="w-full bg-background border border-green-700/50 rounded p-2 text-white" 
                                value={currentService.price_per_1000 || 0} 
                                onChange={e => setCurrentService({...currentService, price_per_1000: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Mínimo</label>
                        <input type="number" className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.min_quantity || ''} 
                            onChange={e => setCurrentService({...currentService, min_quantity: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Máximo</label>
                        <input type="number" className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                            value={currentService.max_quantity || ''} 
                            onChange={e => setCurrentService({...currentService, max_quantity: parseInt(e.target.value)})} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600">Salvar Serviço</button>
                </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? <p className="text-gray-500 col-span-3">Nenhum serviço cadastrado.</p> :
        services.map(service => (
            <div key={service.id} className="bg-surface border border-gray-800 p-6 rounded-xl flex flex-col justify-between hover:border-gray-600 transition-all">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">{service.category}</span>
                        <span className="text-xs font-mono text-gray-500">ID: {service.smm_service_id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex justify-between items-center bg-background p-3 rounded-lg mb-4">
                        <div className="text-center">
                            <span className="block text-xs text-gray-500">Custo</span>
                            <span className="font-bold text-gray-300">R$ {service.cost_per_1000.toFixed(2)}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-xs text-gray-500">Venda</span>
                            <span className="font-bold text-green-400">R$ {service.price_per_1000.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 border-t border-gray-800 pt-4">
                    <button onClick={() => handleEdit(service)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2">
                        <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded flex items-center justify-center">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Services;