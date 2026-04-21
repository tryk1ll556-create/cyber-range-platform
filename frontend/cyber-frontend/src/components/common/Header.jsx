import React from 'react';
import { Link } from 'react-router-dom';
import AvatarDropdown from './AvatarDropdown';

const Header = () => {
  const userId = localStorage.getItem('userId');

  return (
    <header className="bg-[#0f1625]/90 backdrop-blur-sm border-b border-[#2a3a5e] py-4 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]">
            🎯 Cyber Range Platform
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Платформа для обучения пентесту
          </p>
        </Link>

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
    </header>
  );
};

export default Header;