import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { sandboxService } from './services/sandboxService';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ChallengesList from './components/challenges/ChallengesList';
import SandboxesList from './components/sandboxes/SandboxesList';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Modal from './components/common/Modal';
import Toast from './components/common/Toast';
import './styles/index.css';

function AppContent() {
  const [sandboxes, setSandboxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('challenges');
  const [modal, setModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'info' 
  });
  const location = useLocation();
  const { toast } = useUser();

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const startSandbox = async (challengeType) => {
    setIsLoading(true);
    try {
      const newSandbox = await sandboxService.start(challengeType);
      setSandboxes(prev => [...prev, newSandbox]);
      showModal('Успех', `Песочница для ${challengeType} запущена!`, 'success');
    } catch (error) {
      showModal('Ошибка', 'Не удалось запустить песочницу', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSandbox = async (sandboxId) => {
    try {
      await sandboxService.stop(sandboxId);
      setSandboxes(prev => prev.filter(s => s.sandbox_id !== sandboxId));
      showModal('Успех', 'Песочница остановлена', 'success');
    } catch (error) {
      showModal('Ошибка', 'Не удалось остановить песочницу', 'error');
    }
  };

  if (location.pathname === '/register') {
    return <Register />;
  }

  if (location.pathname === '/profile') {
    return <Profile />;
  }

  return (
    <>
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
      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClick={toast.onClick}
          onClose={() => {}}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;