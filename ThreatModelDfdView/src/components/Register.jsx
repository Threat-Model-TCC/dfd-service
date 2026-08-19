import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { styles } from '../styles/commonStyles';

export function Register({ onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mail || !password) {
      setStatus("⚠️ Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setStatus("Criando conta...");

    try {
      await registerUser(name, mail, password);
      setStatus("✅ Conta criada com sucesso! Redirecionando para o login...");
      
      // Aguarda 2 segundos para o usuário ver o sucesso e volta para o login
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      // Critério de aceitação: Impedir e-mail já cadastrado (Geralmente gera erro 400 ou 409)
      if (error.response?.status === 400 || error.response?.status === 409) {
        setStatus("❌ Este e-mail já está cadastrado na ferramenta.");
      } else {
        setStatus("❌ Erro ao conectar com o servidor. Verifique o Gateway.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <h2 style={authStyles.title}>Criar Conta</h2>
        <p style={authStyles.subtitle}>Cadastre-se para começar a modelar seus DFDs</p>

        <form onSubmit={handleSubmit} style={authStyles.form}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              style={authStyles.input}
              disabled={loading}
            />
          </div>

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
              backgroundColor: loading ? '#9e9e9e' : '#4CAF50',
              color: 'white',
              width: '100%',
              padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div style={authStyles.footer}>
          <span>Já tem uma conta? </span>
          <button 
            onClick={onNavigateToLogin} 
            style={authStyles.linkButton}
            disabled={loading}
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}

// Reaproveitando os mesmos estilos do Login
const authStyles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { margin: '0 0 10px 0', textAlign: 'center', color: '#333' },
  subtitle: { margin: '0 0 25px 0', textAlign: 'center', color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#444' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#555' },
  linkButton: { background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', padding: 0 }
};