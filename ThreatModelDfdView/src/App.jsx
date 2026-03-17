import { useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import DfdCanvas from './components/DfdCanvas/DfdCanvas';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [navigationStack, setNavigationStack] = useState([]);

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

  if (currentScreen === 'dashboard') {
    return <Dashboard onOpenProject={handleOpenCanvas} />;
  }

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