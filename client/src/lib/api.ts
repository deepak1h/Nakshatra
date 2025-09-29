// src/lib/api.ts

import { apiRequest } from "./queryClient";

// A helper for simple GET requests that expect JSON
const fetchJson = (url: string) => fetch(url).then(res => res.json());

export const api = {
  // Products
  getProducts: (category?: string) => {
    const url = category ? `/api/products?category=${category}` : '/api/products';
    return fetchJson(url);
  },

  getProduct: (id: string) => {
    return fetchJson(`/api/products/${id}`);
  },

  // --- NEW: User Cart Functions ---
  getUserCart: () => {
    // This function will be used by useQuery
    return fetchJson('/api/user/cart');
  },

  addToCart: (item: { productId: string; quantity: number }) => {
    // This follows your existing pattern for POST requests
    return apiRequest('POST', '/api/user/cart', item);
  },
  
  removeFromCart: (productId: string) => {
    // We assume apiRequest can handle a DELETE method
    return apiRequest('DELETE', `/api/user/cart/${productId}`);
  },

  updateCartQuantity: (item: { productId: string; quantity: number }) => {
    // We assume apiRequest can handle a PUT method
    return apiRequest('PUT', `/api/user/cart/${item.productId}`, { quantity: item.quantity });
  },

  clearCart: () => {
    return apiRequest('DELETE', '/api/user/cart');
  },
  // --- END NEW ---

  // Kundali
  createKundaliRequest: (data: any) => {
    return apiRequest('POST', '/api/kundali', data);
  },

  // Chat
  sendChatMessage: (message: string, userId?: string) => {
    return apiRequest('POST', '/api/chat', { message, userId });
  },

  getChatHistory: (userId: string) => {
    return fetchJson(`/api/chat/history/${userId}`);
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

  
  // --- NEW: Liked Products ---
  getLikedProducts: () => {
    return fetchJson('/api/user/liked-products');
  },

  likeProduct: (productId: string) => {
    return apiRequest('POST', '/api/user/liked-products', { productId });
  },

  unlikeProduct: (productId: string) => {
    return apiRequest('DELETE', `/api/user/liked-products/${productId}`);
  },
  // --- END NEW ---

  // Admin
  getAdminOrderById: (orderId: string) => {
    return apiRequest('GET', `/api/admin/orders/${orderId}`);
  },

  getAdminOrders: () => {
    return apiRequest('GET', '/api/admin/orders');
  },

  updateAdminOrder: (orderId: string, data: any) => {
    return apiRequest('PUT', `/api/admin/orders/${orderId}`, data);
  },

};