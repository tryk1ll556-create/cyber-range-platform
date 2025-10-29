import React, { useState } from 'react';
import { sandboxService } from './services/sandboxService';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ChallengesList from './components/challenges/ChallengesList';
import SandboxesList from './components/sandboxes/SandboxesList';
import './styles/index.css';

function App() {
  const [sandboxes, setSandboxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('challenges');

  const startSandbox = async (challengeType) => {
    setIsLoading(true);
    try {
      const newSandbox = await sandboxService.start(challengeType);
      setSandboxes(prev => [...prev, newSandbox]);
      alert(`Песочница для ${challengeType} запущена!`);
    } catch (error) {
      alert('Ошибка при запуске песочницы');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSandbox = async (sandboxId) => {
    try {
      await sandboxService.stop(sandboxId);
      setSandboxes(prev => prev.filter(s => s.sandbox_id !== sandboxId));
      alert('Песочница остановлена');
    } catch (error) {
      alert('Ошибка при остановке песочницы');
    }
  };

  return (
    <div className="App">
      <Header />
      
      <Navigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sandboxCount={sandboxes.length}
      />

      <main className="main-content">
        {activeTab === 'challenges' && (
          <ChallengesList 
            onStartSandbox={startSandbox}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'sandboxes' && (
          <SandboxesList 
            sandboxes={sandboxes}
            onStopSandbox={stopSandbox}
          />
        )}
      </main>
    </div>
  );
}

export default App;