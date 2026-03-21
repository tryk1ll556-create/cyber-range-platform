import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Toast = ({ message, type = 'info', onClose, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClick) onClick();
      onClose();
    }, 300);
  };

  const colors = {
    success: 'border-[#00f0ff] bg-[#00f0ff]/10',
    error: 'border-[#ff3b9c] bg-[#ff3b9c]/10',
    info: 'border-[#2a3a5e] bg-[#1a2332]',
    achievement: 'border-[#ff3b9c] bg-gradient-to-r from-[#1a2332] to-[#2a1a2a]'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    achievement: '🏆'
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`border rounded-xl p-4 shadow-lg ${colors[type]} backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icons[type]}</div>
          <div className="flex-1">
            <p className="text-sm text-white">{message}</p>
            {type === 'achievement' && (
              <button
                onClick={handleClick}
                className="mt-2 text-xs text-[#00f0ff] hover:text-[#ff3b9c] transition-colors"
              >
                🎯 Посмотреть достижения →
              </button>
            )}
          </div>
          <button
            onClick={handleClick}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;