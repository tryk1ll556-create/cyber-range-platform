import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { backendApi } from '../services/backendApi';
import Modal from '../components/common/Modal';

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
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
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,240,255,0.2)]">
        <Link to="/" className="text-gray-400 hover:text-[#00f0ff] transition-all text-sm flex items-center gap-1 mb-6">
          ← На главную
        </Link>

        <h2 className="text-3xl font-bold text-center text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff] mb-6">
          🔐 Вход в систему
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Имя пользователя</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Пароль</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-lg hover:bg-[#00f0ff]/80 transition-all shadow-[0_0_15px_#00f0ff] disabled:opacity-50"
          >
            {loading ? 'Вход...' : '🚀 Войти'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[#00f0ff] hover:underline">
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