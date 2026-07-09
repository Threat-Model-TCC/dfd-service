import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import DfdCanvas from './components/DfdCanvas/DfdCanvas';
import Login from './components/Login';
import { Register } from './components/Register';

export default function App() {
  // Inicialização inteligente: se houver token, começa no dashboard, senão, no login
  const [currentScreen, setCurrentScreen] = useState(() => {
    const token = localStorage.getItem('accessToken');
    return token ? 'dashboard' : 'login';
  });
  
  const [navigationStack, setNavigationStack] = useState([]);

  // Monitora alterações globais de logout (disparadas pelo interceptor do Axios)
  useEffect(() => {
    const handleLogoutEvent = () => {
      setCurrentScreen('login');
      setNavigationStack([]);
    };

    // Caso precise forçar a atualização de tela ao limpar o localStorage em outras partes
    window.addEventListener('storage', (e) => {
      if (e.key === 'accessToken' && !e.newValue) {
        handleLogoutEvent();
      }
    });
  }, []);

  const handleOpenCanvas = (diagramId) => {
    console.log(`Abrindo Canvas para o contextDiagramId: ${diagramId}`);
    setNavigationStack([{ dfdId: diagramId, levelNumber: 0, parentId: null }]);
    setCurrentScreen('canvas');
  };

  const handleDecompose = (childDfdId, levelNumber, parentDfdId) => {
    setNavigationStack(prev => [...prev, { dfdId: childDfdId, levelNumber: levelNumber, parentId: parentDfdId }]);
  };

  const handleReturnToParent = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  /* ==========================================
     RENDERIZAÇÃO CONDICIONAL DAS TELAS
     ========================================== */
  
  if (currentScreen === 'login') {
    return (
      <Login 
        onNavigateToRegister={() => setCurrentScreen('register')} 
        onLoginSuccess={() => setCurrentScreen('dashboard')} 
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <Register 
        onNavigateToLogin={() => setCurrentScreen('login')} 
      />
    );
  }

  if (currentScreen === 'dashboard') {
    return <Dashboard onOpenProject={handleOpenCanvas} />;
  }

  // Tela padrão: Canvas
  const currentNavigation = navigationStack[navigationStack.length - 1];
  const canReturnToParent = navigationStack.length > 1;

  return (
    <DfdCanvas 
      dfdId={currentNavigation?.dfdId}
      levelNumber={currentNavigation?.levelNumber || 0}
      parentDfdId={currentNavigation?.parentId || null}
      onDecompose={handleDecompose}
      onReturnToParent={handleReturnToParent}
      canReturn={canReturnToParent}
      onBackToDashboard={() => {
        setCurrentScreen('dashboard');
        setNavigationStack([]);
      }}
    />
  );
}