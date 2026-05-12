import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { sandboxService } from './services/sandboxService';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ChallengesList from './components/challenges/ChallengesList';
import SandboxesList from './components/sandboxes/SandboxesList';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Modal from './components/common/Modal';
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
  const { addXP } = useUser();

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const startSandbox = async (challengeType) => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      showModal('Доступ запрещен', 'Авторизуйтесь, чтобы запускать задания', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newSandbox = await sandboxService.start(challengeType, userId);
      setSandboxes(prev => [...prev, newSandbox]);
      addXP(25);
      showModal('Успех', `Песочница для ${challengeType} запущена!`, 'success');
    } catch (error) {
      console.error('Ошибка запуска:', error);
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
      console.error('Ошибка остановки:', error);
      showModal('Ошибка', 'Не удалось остановить песочницу', 'error');
    }
  };

  React.useEffect(() => {
    const loadSandboxes = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const data = await sandboxService.getAll(userId);
          setSandboxes(data);
        } catch (error) {
          console.error('Ошибка загрузки песочниц:', error);
        }
      }
    };
    loadSandboxes();
  }, []);

  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>;
  }

  if (location.pathname === '/profile') {
    return (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    );
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;