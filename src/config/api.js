// src/config/api.js
// Centraliza la URL base del backend.
// En producción (EC2), VITE_API_URL se inyecta en build time via Docker ARG.
// En desarrollo local, usa el proxy de vite.config.js o localhost.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const API = {
  DESPACHOS: `${API_BASE_URL}/api/v1/despachos`,
  VENTAS: `${API_BASE_URL}/api/v1/ventas`,
};
