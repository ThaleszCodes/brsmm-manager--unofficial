import { supabase } from './supabase';
import { Service, Order, Copy, Settings } from '../types';

// --- SERVICES ---
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase.from('services').select('*');
  if (error) throw error;
  return data || [];
};

export const saveService = async (service: Service) => {
  const { error } = await supabase.from('services').upsert(service);
  if (error) throw error;
};

export const deleteService = async (id: string) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
};

// --- ORDERS ---
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const saveOrder = async (order: Order) => {
  const { error } = await supabase.from('orders').insert(order);
  if (error) throw error;
};

export const updateOrderStatus = async (id: string, updates: Partial<Order>) => {
  const { error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// --- COPIES ---
export const getCopies = async (): Promise<Copy[]> => {
  const { data, error } = await supabase.from('copies').select('*');
  if (error) throw error;
  return data || [];
};

export const saveCopy = async (copy: Copy) => {
  const { error } = await supabase.from('copies').upsert(copy);
  if (error) throw error;
};

export const deleteCopy = async (id: string) => {
  const { error } = await supabase.from('copies').delete().eq('id', id);
  if (error) throw error;
};

// --- SETTINGS ---
export const getSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase.from('settings').select('*').single();
  
  if (error) {
    console.error("Error fetching settings:", error);
    // Fallback/Default if empty or error
    return {
      api_key: '',
      profit_margin_percent: 30,
      proxy_url: 'https://corsproxy.io/?'
    };
  }

  // Pre-fill BRSMM key if provided in prompt but DB is empty on specific field
  // Note: This logic assumes the DB row exists (created via SQL provided).
  if (data && !data.api_key) {
      // User provided this key in the prompt, let's be helpful and suggest it
      // In a real app we might not do this, but for this specific request:
      return { ...data, api_key: 'f2934797a2c96c1dc45bc0b509ec29f3' };
  }

  return data;
};

export const saveSettings = async (settings: Settings) => {
  // Always update row 1
  const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
  if (error) throw error;
};

// --- AUTH (Local Session) ---
// We keep auth local for simplicity as requested (Single Admin)
const SESSION_KEY = 'smm_session';
export const getSession = () => localStorage.getItem(SESSION_KEY) === 'true';
export const setSession = (active: boolean) => localStorage.setItem(SESSION_KEY, String(active));
