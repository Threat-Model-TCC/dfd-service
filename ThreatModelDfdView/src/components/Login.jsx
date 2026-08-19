import React, { useState, useEffect, useCallback } from 'react';
import { loginUser, loginWithGoogle } from '../services/api';
import { styles } from '../styles/commonStyles';

export default function Login({ onNavigateToRegister, onLoginSuccess }) {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = useCallback(() => {
    setStatus("✅ Login realizado com sucesso!");
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.location.href = '/dashboard';
    }
  }, [onLoginSuccess]);

  const handleAuthError = useCallback((error, context = 'login') => {
    console.error(`Erro no ${context}:`, error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      setStatus("❌ E-mail e/ou senha inválidos.");
    } else {
      setStatus("❌ Erro ao conectar com o servidor. Verifique o Gateway.");
    }
  }, []);

  const handleGoogleResponse = useCallback(async (response) => {
    setLoading(true);
    setStatus("Autenticando com Google...");
    try {
      await loginWithGoogle(response.credential);
      handleAuthSuccess();
    } catch (error) {
      handleAuthError(error, 'login com Google');
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess, handleAuthError]);

  // Carrega o script do Google Identity Services e renderiza o botão oficial
  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: '134929585022-9q6kj6u7c4ciqo0j0hkqh9qk88emfc4o.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });

      const container = document.getElementById('googleSignInDiv');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          locale: 'pt_BR',
        });
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.getElementById('google-identity-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return () => existingScript.removeEventListener('load', initializeGoogle);
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mail || !password) {
      setStatus("⚠️ Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setStatus("Autenticando...");

    try {
      await loginUser(mail, password);
      handleAuthSuccess();
    } catch (error) {
      handleAuthError(error, 'login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <h2 style={authStyles.title}>ThreatModel DFD</h2>
        <p style={authStyles.subtitle}>Entre com suas credenciais para acessar seus projetos</p>

        <form onSubmit={handleSubmit} style={authStyles.form}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>E-mail</label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="seu@email.com"
              style={authStyles.input}
              disabled={loading}
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={authStyles.input}
              disabled={loading}
            />
          </div>

          {status && (
            <div style={{
              ...styles.status,
              backgroundColor: status.includes('✅') ? '#e8f5e9' : '#ffebee',
              color: status.includes('✅') ? '#2e7d32' : '#c62828',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              {status}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              backgroundColor: loading ? '#9e9e9e' : '#2196F3',
              color: 'white',
              width: '100%',
              padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={authStyles.divider}>
          <span style={authStyles.dividerLine}></span>
          <span style={authStyles.dividerText}>ou</span>
          <span style={authStyles.dividerLine}></span>
        </div>

        {/* O Google renderiza o botão oficial dentro dessa div */}
        <div id="googleSignInDiv" style={authStyles.googleButtonWrapper}></div>

        <div style={authStyles.footer}>
          <span>Não tem uma conta? </span>
          <button
            onClick={onNavigateToRegister}
            style={authStyles.linkButton}
            disabled={loading}
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}

const authStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: '0 0 10px 0', textAlign: 'center', color: '#333' },
  subtitle: { margin: '0 0 25px 0', textAlign: 'center', color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#444' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' },
  divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#ddd' },
  dividerText: { padding: '0 10px', color: '#999', fontSize: '13px' },
  googleButtonWrapper: { display: 'flex', justifyContent: 'center' },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#555' },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2196F3',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: 0,
  }
};