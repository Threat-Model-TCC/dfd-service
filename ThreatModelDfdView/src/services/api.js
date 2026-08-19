import axios from 'axios';

// URL base apontando diretamente para o seu API Gateway (porta 9191)
const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variáveis de controle para a renovação síncrona do Token
let isRefreshing = false;
let failedQueue = [];

// Função que processa as requisições que ficaram aguardando o novo token
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/* ==========================================================================
   1. INTERCEPTOR DE REQUISIÇÃO (Injeta o Access Token em todas as chamadas)
   ========================================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Use the .set() method to safely inject the header in modern Axios
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ==========================================================================
   2. INTERCEPTOR DE RESPOSTA (Gerencia o Erro 401 e faz o Refresh Automático)
   ========================================================================== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for na própria rota de refresh, limpa tudo e desloga (evita loop infinito)
    if (originalRequest.url.includes('/auth/refresh')) {
      handleLogout();
      return Promise.reject(error);
    }

    // Intercepta apenas erros 401 (Não Autorizado) e garante que não estamos re-tentando a mesma requisição
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já houver um processo de refresh acontecendo, coloca esta requisição na fila de espera
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Marca a requisição original para não tentar o refresh novamente em caso de falha externa
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // Se não houver sequer o refresh token localmente, força o logout
      if (!refreshToken) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      try {
        /* ATENÇÃO: Conforme o AuthenticationController.java, o backend espera 
          uma STRING CRUA (@RequestBody String) e não um objeto JSON.
          Por isso, enviamos o token diretamente e mudamos o Content-Type para text/plain.
        */
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`, 
          refreshToken, 
          {
            headers: { 'Content-Type': 'text/plain' }
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Salva os novos tokens retornados pelo TokensDTO
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Atualiza o header padrão do Axios para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.set['Authorization'] = `Bearer ${accessToken}`;

        // Libera todas as requisições que estavam travadas na fila
        processQueue(null, accessToken);
        isRefreshing = false;

        // Executa a requisição original que havia falhado no início de tudo
        return api(originalRequest);

      } catch (refreshError) {
        // Se a renovação falhar (ex: refresh token expirou no banco), limpa a fila e desloga o usuário
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Função auxiliar para limpar a sessão e redirecionar para a tela de Login
export const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Emite um evento customizado ou força o redirecionamento nativo se necessário
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/* ==========================================================================
   3. FUNÇÕES DE AUTENTICAÇÃO (Mapeadas idênticas aos DTOs do seu Java)
   ========================================================================== */

/**
 * Realiza o login do usuário na ferramenta
 * @param {string} mail 
 * @param {string} password 
 */
export const loginUser = async (mail, password) => {
  // Envia exatamente "mail" para bater com o LoginDTO do Spring
  const response = await api.post('/auth/login', { mail, password });
  
  const { accessToken, refreshToken } = response.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data;
};

/**
 * Realiza login/cadastro via Google OAuth
 * @param {string} idToken - o credential retornado pelo Google Identity Services
 */
export const loginWithGoogle = async (idToken) => {
  // Bate com o GoogleLoginDTO do Spring: record GoogleLoginDTO(String idToken)
  const response = await api.post('/auth/login/google', { idToken });

  const { accessToken, refreshToken } = response.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return response.data;
};

/**
 * Cria uma nova conta de usuário
 * @param {string} name 
 * @param {string} mail 
 * @param {string} password 
 */
export const registerUser = async (name, mail, password) => {
  // Envia "name", "mail" e "password" batendo com o RegisterUserDTO do Spring
  const response = await api.post('/auth/register', { name, mail, password });
  return response.data;
};

export default api;