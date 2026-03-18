import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { backendApi } from '../services/backendApi';
import Modal from '../components/common/Modal';

const Register = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await backendApi.register(
        formData.username,
        formData.email,
        formData.password,
        formData.full_name
      );

      console.log('✅ Регистрация успешна:', result);
      
      // Обновляем контекст с данными пользователя
      updateUser(result);

      // Сохраняем пользователя в localStorage
      localStorage.setItem('userId', result.id);
      localStorage.setItem('user', JSON.stringify(result));

      setModal({
        isOpen: true,
        title: 'Успех',
        message: 'Регистрация прошла успешно! Сейчас вы будете перенаправлены в профиль.',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: error.message || 'Не удалось зарегистрироваться',
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
          📝 Регистрация
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Имя пользователя *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Пароль *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Полное имя (необязательно)</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-lg hover:bg-[#00f0ff]/80 transition-all shadow-[0_0_15px_#00f0ff] disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : '🚀 Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[#00f0ff] hover:underline">
            Войти
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

export default Register;