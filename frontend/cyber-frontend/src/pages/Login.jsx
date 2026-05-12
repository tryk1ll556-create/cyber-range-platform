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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await backendApi.login(form.username, form.password);
      updateUser(data);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('user', JSON.stringify(data));
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
        
        {/* Верхняя панель: кнопка назад и переключатель темы */}
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
            />
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