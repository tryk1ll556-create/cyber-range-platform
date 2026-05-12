import React from 'react';
import { Link } from 'react-router-dom';
import AvatarDropdown from './AvatarDropdown';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const userId = localStorage.getItem('userId');
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="cyber-header shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]">
            🎯 Cyber Range Platform
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Платформа для обучения пентесту
          </p>
        </Link>

        <div className="flex gap-3 items-center">
          {/* Кнопка переключения темы */}
          <button
            onClick={toggleTheme}
            className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-all"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {!userId ? (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border-2 border-[#00f0ff] text-[#00f0ff] 
                           hover:bg-[#00f0ff] hover:text-black transition-all"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#00f0ff] text-black 
                           hover:bg-[#00f0ff]/80 transition-all"
              >
                Регистрация
              </Link>
            </div>
          ) : (
            <AvatarDropdown />
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;