import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#0f1625]/90 backdrop-blur-sm border-b border-[#2a3a5e] py-6 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Логотип и название */}
        <Link to="/" className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff] mb-1">
            🎯 Cyber Range Platform
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Платформа для обучения пентесту
          </p>
        </Link>

        {/* Быстрая информация (можно потом добавить уровень или очки) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">Уровень</div>
            <div className="text-[#00f0ff] font-bold">7</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1a2332] border-2 border-[#00f0ff] flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;