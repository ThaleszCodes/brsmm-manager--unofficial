import { getSettings } from './storage';

const API_BASE = 'https://brsmm.com/api/v2';

// BRSMM Response Types
interface BRSMMAddOrderResponse {
  order: number;
  error?: string;
}

interface BRSMMStatusResponse {
  status: string;
  start_count: string;
  remains: string;
  error?: string;
}

// Helper for Fetching with Proxy and Key
const fetchAPI = async (params: Record<string, string>) => {
  const settings = await getSettings();
  if (!settings.api_key) throw new Error("API Key não configurada.");

  const urlParams = new URLSearchParams({
    key: settings.api_key,
    ...params,
  });

  // Construct URL. Use proxy if configured to bypass CORS.
  const targetUrl = `${API_BASE}?${urlParams.toString()}`;
  const finalUrl = settings.proxy_url 
    ? `${settings.proxy_url}${encodeURIComponent(targetUrl)}` 
    : targetUrl;

  try {
    const response = await fetch(finalUrl);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error: any) {
    console.error("BRSMM API Error:", error);
    throw error;
  }
};

export const placeOrder = async (serviceId: string, link: string, quantity: number): Promise<{ orderId: string }> => {
  const response = await fetchAPI({
    action: 'add',
    service: serviceId,
    link: link,
    quantity: String(quantity),
  }) as BRSMMAddOrderResponse;

  return { orderId: String(response.order) };
};

export const checkOrderStatus = async (orderId: string): Promise<{ status: string; start_count: string; remains: string }> => {
  const response = await fetchAPI({
    action: 'status',
    order: orderId,
  }) as BRSMMStatusResponse;

  return {
    status: response.status, // pending, processing, in_progress, completed, partial, canceled
    start_count: response.start_count,
    remains: response.remains
  };
};

export const getBalance = async (): Promise<{ balance: string, currency: string }> => {
    const response = await fetchAPI({
        action: 'balance'
    });
    return response;
                                                 }
