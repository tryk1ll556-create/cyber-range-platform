import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
const Header = () => {
  const { user } = useUser();
  const avatar = localStorage.getItem('avatar') || '👨‍💻';

  return (
    <header className="bg-[#0f1625]/90 backdrop-blur-sm border-b border-[#2a3a5e] py-4 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Логотип и название */}
        <Link to="/" className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]">
            🎯 Cyber Range Platform
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Платформа для обучения пентесту
          </p>
        </Link>

        {/* Аватар + имя → переход в профиль */}
        <Link
          to="/profile"
          className="flex items-center gap-2 bg-[#1a2332] border border-[#2a3a5e] rounded-full px-3 py-1 hover:border-[#00f0ff] transition-all"
        >
          <span className="text-2xl">{avatar}</span>
          <span className="text-sm text-white hidden sm:inline">{user.name}</span>
        </Link>

      </div>
    </header>
  );
};

export default Header;