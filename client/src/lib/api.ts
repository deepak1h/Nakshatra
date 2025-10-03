// src/lib/api.ts

import { apiRequest, apiRequestWithFile } from "./queryClient";

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
  getAdminOrderById: (orderId: string, token: string | null) => {
    return apiRequest('GET', `/api/admin/orders/${orderId}`,null, token);
  },

  getAdminOrders: (token: string | null) => {
    console.log("Fetching admin orders with token:", token);
    return apiRequest('GET', '/api/admin/orders',null ,token);
  },

  updateAdminOrder: (orderId: string, data: any, token: string | null) => {
    return apiRequest('PUT', `/api/admin/orders/${orderId}`, data, token);
  },

// Your existing getAdminProducts function (already fixed)
getAdminProducts: (token: string | null) => {
  return apiRequest('GET', '/api/admin/products', null, token);
},

// Add the token parameter to the create function
createAdminProduct: (productData: any, token: string | null) => {
  return apiRequestWithFile('POST', '/api/admin/products', productData, token);
},

// Add the token parameter to the update function
updateAdminProduct: (productId: string, productData: any, token: string | null) => {
  console.log("xyz product with data:", productData);
  return apiRequestWithFile('PUT', `/api/admin/products/${productId}`, productData, token);
},

// Add the token parameter to the delete function
deleteAdminProduct: (productId: string, token: string | null) => {
  // Note the 'null' argument because DELETE requests typically don't have a body
  return apiRequest('DELETE', `/api/admin/products/${productId}`, null, token);
},

// New function to get dashboard stats

  getAdminDashboardStats: (token: string | null) => {
    return apiRequest('GET', '/api/admin/dashboard-stats', null, token);
  },

   getAdminKundaliRequests: (token: string | null) => {
    return apiRequest('GET', '/api/admin/kundali-requests', null, token);
  },

  updateAdminKundaliRequest: (id: string, data: { status: string; reportUrl?: string }, token: string | null) => {
    return apiRequest('PUT', `/api/admin/kundali-requests/${id}`, data, token);
  },


};