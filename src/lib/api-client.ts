import axios from 'axios';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const apiBaseUrl =
  configuredApiUrl ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3333/api/v1' : '');

if (!apiBaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL não está configurada. Defina a URL da API no arquivo de ambiente antes de iniciar o frontend.'
  );
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
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
