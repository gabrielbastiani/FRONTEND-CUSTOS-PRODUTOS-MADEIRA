import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  // Não fixamos Content-Type globalmente: Axios define application/json para
  // objetos e adiciona automaticamente o boundary correto em FormData.
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Erro inesperado na comunicação com o servidor.';
    return Promise.reject(new Error(message));
  }
);