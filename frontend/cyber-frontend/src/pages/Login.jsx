import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';
import Modal from '../components/common/Modal';

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Для username: при вводе сразу фильтруем — только латиница, цифры, подчёркивание
    if (name === 'username') {
      const englishOnly = /^[a-zA-Z0-9_]*$/;
      if (englishOnly.test(value) || value === '') {
        setForm({ ...form, [name]: value });
      }
      return;
    }
    
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Жёсткая проверка username перед отправкой
    const englishRegex = /^[a-zA-Z0-9_]+$/;
    if (!form.username || form.username.length < 3) {
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: 'Имя пользователя должно содержать минимум 3 символа',
        type: 'error'
      });
      return;
    }
    
    if (!englishRegex.test(form.username)) {
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: 'Имя пользователя должно содержать ТОЛЬКО латинские буквы (a-z, A-Z), цифры (0-9) и знак подчёркивания (_). Русские и другие символы запрещены.',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await backendApi.login(form.username, form.password);
      
      const savedUser = localStorage.getItem('user');
      let progressData = {};
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          progressData = {
            level: parsed.level || 1,
            xp: parsed.xp || 0,
            nextLevelXp: parsed.nextLevelXp || 100,
            rank: parsed.rank || 'Новичок',
            completedTasks: parsed.completedTasks || 0,
            challengesCompleted: parsed.challengesCompleted || [],
            attacksDetected: parsed.attacksDetected || 0,
            badges: parsed.badges || []
          };
        } catch (e) {}
      }
      
      updateUser({
        ...data,
        ...progressData
      });
      
      localStorage.setItem('userId', data.id);
      
      setModal({
        isOpen: true,
        title: 'Успех',
        message: 'Вход выполнен! Перенаправление...',
        type: 'success'
      });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: err.message || 'Неверное имя пользователя или пароль',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
      isDark ? 'bg-[#0a0f1e]' : 'bg-gray-100'
    }`}>
      <div className={`rounded-xl p-8 max-w-md w-full transition-all duration-300 ${
        isDark 
          ? 'bg-[#141b2b] border border-[#2a3a5e] shadow-[0_0_30px_rgba(0,240,255,0.2)]'
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className={`text-sm flex items-center gap-1 transition-all ${
            isDark ? 'text-gray-400 hover:text-[#00f0ff]' : 'text-gray-500 hover:text-[#0891b2]'
          }`}>
            ← На главную
          </Link>
          <button
            onClick={toggleTheme}
            className="text-2xl hover:scale-110 transition-all"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <h2 className={`text-3xl font-bold text-center mb-6 ${
          isDark ? 'text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff]' : 'text-[#0891b2]'
        }`}>
          🔐 Вход в систему
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Имя пользователя
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className={`w-full rounded-lg px-4 py-3 focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#1a2332] border border-[#2a3a5e] text-white focus:border-[#00f0ff]'
                  : 'bg-gray-100 border border-gray-300 text-gray-800 focus:border-[#0891b2]'
              }`}
              placeholder="пример: john_doe_123"
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              ⚠️ Только латинские буквы, цифры и знак подчёркивания. Русские и другие символы запрещены!
            </p>
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className={`w-full rounded-lg px-4 py-3 focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#1a2332] border border-[#2a3a5e] text-white focus:border-[#00f0ff]'
                  : 'bg-gray-100 border border-gray-300 text-gray-800 focus:border-[#0891b2]'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-lg transition-all disabled:opacity-50 ${
              isDark
                ? 'bg-[#00f0ff] text-black hover:bg-[#00f0ff]/80 shadow-[0_0_15px_#00f0ff]'
                : 'bg-[#0891b2] text-white hover:bg-[#0e7c9e] shadow-md'
            }`}
          >
            {loading ? 'Вход...' : '🚀 Войти'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Нет аккаунта?{' '}
          <Link to="/register" className={`hover:underline ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
            Зарегистрироваться
          </Link>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Login;