import { apiRequest } from "./queryClient";

export const api = {
  // Products
  getProducts: (category?: string) => {
    const url = category ? `/api/products?category=${category}` : '/api/products';
    return fetch(url).then(res => res.json());
  },

  getProduct: (id: string) => {
    return fetch(`/api/products/${id}`).then(res => res.json());
  },

  // Kundali
  createKundaliRequest: (data: any) => {
    return apiRequest('POST', '/api/kundali', data);
  },

  // Chat
  sendChatMessage: (message: string, userId?: string) => {
    return apiRequest('POST', '/api/chat', { message, userId });
  },

  getChatHistory: (userId: string) => {
    return fetch(`/api/chat/history/${userId}`).then(res => res.json());
  },

  // Contact
  sendContactMessage: (data: any) => {
    return apiRequest('POST', '/api/contact', data);
  },

  // Orders
  createOrder: (data: any) => {
    return apiRequest('POST', '/api/orders', data);
  },

  createOrderItem: (data: any) => {
    return apiRequest('POST', '/api/order-items', data);
  },
};
