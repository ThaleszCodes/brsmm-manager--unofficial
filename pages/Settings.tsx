import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { Settings as SettingsType } from '../types';
import { Save, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettingsData] = useState<SettingsType>({ 
    api_key: '', 
    profit_margin_percent: 30,
    proxy_url: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettingsData);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Configurações</h1>

      <form onSubmit={handleSave} className="bg-surface p-8 rounded-xl border border-gray-800 space-y-6 shadow-xl">
        
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3 text-green-400 text-sm">
            <ShieldCheck size={20} className="shrink-0"/>
            <p>Seus dados estão seguros e sincronizados com seu banco de dados Supabase na nuvem.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">API Key (BRSMM)</label>
          <input
            type="password"
            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            value={settings.api_key}
            onChange={(e) => setSettingsData({...settings, api_key: e.target.value})}
            placeholder="Cole sua chave API aqui..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Porcentagem de Lucro Padrão (%)</label>
          <input
            type="number"
            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            value={settings.profit_margin_percent}
            onChange={(e) => setSettingsData({...settings, profit_margin_percent: parseFloat(e.target.value)})}
            placeholder="30"
          />
          <p className="text-xs text-gray-500 mt-2">Usado para calcular sugestão de preço ao criar serviços.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Proxy CORS (Opcional)</label>
          <input
            type="text"
            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            value={settings.proxy_url}
            onChange={(e) => setSettingsData({...settings, proxy_url: e.target.value})}
            placeholder="https://corsproxy.io/?"
          />
           <p className="text-xs text-gray-500 mt-2">Deixe em branco para conexão direta. Use <code>https://corsproxy.io/?</code> se tiver erros de CORS.</p>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-blue-600 text-white'
          }`}
        >
           {saved ? 'Salvo com Sucesso!' : <><Save size={20} /> Salvar Configurações</>}
        </button>
      </form>
    </div>
  );
};

export default Settings;