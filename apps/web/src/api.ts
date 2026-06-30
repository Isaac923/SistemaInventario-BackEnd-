import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getUserRole(): 'ADMIN' | 'CAJERO' | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getUserRole() === 'ADMIN';
}

export type Usuario = {
  id: string;
  email: string;
  nombre: string | null;
  role: 'ADMIN' | 'CAJERO';
  createdAt: string;
  updatedAt: string;
};

export function fetchUsuarios(): Promise<Usuario[]> {
  return api.get('/usuarios').then(r => r.data);
}
