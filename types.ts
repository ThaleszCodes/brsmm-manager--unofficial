export interface Service {
  id: string;
  name: string;
  description: string;
  smm_service_id: string;
  cost_per_1000: number;
  price_per_1000: number;
  min_quantity: number;
  max_quantity: number;
  category: string;
}

export interface Order {
  id: string;
  service_id: string;
  client_link: string;
  quantity: number;
  brsmm_order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'canceled' | 'error' | 'partial';
  total_cost: number; // Cost to me
  total_price: number; // Price to client
  start_count?: string;
  remains?: string;
  created_at: string;
  updated_at: string;
}

export interface Copy {
  id: string;
  title: string;
  content: string;
}

export interface Settings {
  api_key: string;
  profit_margin_percent: number; // e.g. 20 for 20%
  proxy_url: string; // To bypass CORS if needed
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  canceled: 'Cancelado',
  error: 'Erro',
  partial: 'Parcial',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  completed: 'bg-green-500/20 text-green-500',
  canceled: 'bg-red-500/20 text-red-500',
  error: 'bg-red-500/20 text-red-500',
  partial: 'bg-purple-500/20 text-purple-500',
};