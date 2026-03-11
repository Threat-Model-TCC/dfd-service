import { useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import DfdCanvas from './components/DfdCanvas/DfdCanvas';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedDiagramId, setSelectedDiagramId] = useState(null);

  const handleOpenCanvas = (diagramId) => {
    console.log(`Abrindo Canvas para o contextDiagramId: ${diagramId}`);
    setSelectedDiagramId(diagramId);
    setCurrentScreen('canvas');
  };

  if (currentScreen === 'dashboard') {
    return <Dashboard onOpenProject={handleOpenCanvas} />;
  }

  return (
    <DfdCanvas 
      projectId={selectedDiagramId} 
      onBack={() => setCurrentScreen('dashboard')} 
    />
  );
}