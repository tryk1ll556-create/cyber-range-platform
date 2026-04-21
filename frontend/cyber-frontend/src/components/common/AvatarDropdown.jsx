import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const AvatarDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { resetUser } = useUser();
  const avatar = localStorage.getItem('avatar') || '👨‍💻';
  
  const userFromStorage = localStorage.getItem('user');
  const userName = userFromStorage ? JSON.parse(userFromStorage).username : 'Гость';

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('avatar');
    resetUser();
    navigate('/');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1a2332] border border-[#2a3a5e] rounded-full px-3 py-1 hover:border-[#00f0ff] transition-all"
      >
        <span className="text-2xl">{avatar}</span>
        <span className="text-sm text-white hidden sm:inline">{userName}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a2332] border border-[#2a3a5e] rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 border-b border-[#2a3a5e] text-white text-sm">
            {userName}
          </div>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#2a3a5e] hover:text-white transition-colors"
          >
            <span>👤</span> Профиль
          </Link>
          <Link
            to="/profile?tab=settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#2a3a5e] hover:text-white transition-colors"
          >
            <span>⚙️</span> Настройки
          </Link>
          <div className="border-t border-[#2a3a5e] my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-[#2a3a5e] hover:text-red-300 transition-colors"
          >
            <span>🚪</span> Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;