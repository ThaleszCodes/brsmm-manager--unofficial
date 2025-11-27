import React, { useState, useEffect } from 'react';
import { getCopies, saveCopy, deleteCopy } from '../services/storage';
import { Copy } from '../types';
import { Copy as CopyIcon, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Copies: React.FC = () => {
  const [copies, setCopies] = useState<Copy[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCopy, setCurrentCopy] = useState<Partial<Copy>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshCopies = () => getCopies().then(setCopies);

  useEffect(() => {
    refreshCopies();
  }, []);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (copy: Copy) => {
    setCurrentCopy(copy);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deletar esta copy?')) {
      await deleteCopy(id);
      refreshCopies();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCopy.title || !currentCopy.content) return;
    
    await saveCopy({
        id: currentCopy.id || uuidv4(),
        title: currentCopy.title!,
        content: currentCopy.content!
    });
    refreshCopies();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Copys Rápidas</h1>
        <button onClick={() => { setCurrentCopy({}); setIsEditing(true); }} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Nova Copy
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{currentCopy.id ? 'Editar Copy' : 'Nova Copy'}</h2>
                <button onClick={() => setIsEditing(false)}><X className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400">Título</label>
                    <input className="w-full bg-background border border-gray-700 rounded p-2 text-white" 
                        value={currentCopy.title || ''} 
                        onChange={e => setCurrentCopy({...currentCopy, title: e.target.value})} autoFocus required />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Conteúdo (WhatsApp/Telegram)</label>
                    <textarea className="w-full bg-background border border-gray-700 rounded p-2 text-white h-40 font-mono text-sm" 
                        value={currentCopy.content || ''} 
                        onChange={e => setCurrentCopy({...currentCopy, content: e.target.value})} required />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded">Salvar</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {copies.length === 0 ? <p className="text-gray-500 col-span-3">Nenhuma copy salva.</p> :
        copies.map(copy => (
            <div key={copy.id} className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg">{copy.title}</h3>
                    <div className="flex gap-2">
                         <button onClick={() => handleEdit(copy)} className="text-gray-500 hover:text-primary"><Edit2 size={16}/></button>
                         <button onClick={() => handleDelete(copy.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                </div>
                
                <div className="bg-background p-4 rounded-lg border border-gray-800 flex-1 mb-4 overflow-hidden relative group">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{copy.content}</pre>
                </div>

                <button 
                    onClick={() => handleCopyText(copy.id, copy.content)}
                    className={`w-full py-2 rounded font-medium flex items-center justify-center gap-2 transition-all ${
                        copiedId === copy.id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                >
                    {copiedId === copy.id ? <Check size={18} /> : <CopyIcon size={18} />}
                    {copiedId === copy.id ? 'Copiado!' : 'Copiar Texto'}
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Copies;
