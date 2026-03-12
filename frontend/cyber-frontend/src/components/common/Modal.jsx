import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const colors = {
    success: 'border-[#00f0ff] bg-[#00f0ff]/10',
    error: 'border-[#ff3b9c] bg-[#ff3b9c]/10',
    info: 'border-[#2a3a5e] bg-[#1a2332]'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`max-w-md w-full rounded-xl border ${colors[type]} p-6 shadow-[0_0_30px_rgba(0,240,255,0.3)]`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icons[type]}</span>
            <h3 className="text-xl font-bold text-[#00f0ff]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00f0ff] text-black rounded-lg font-mono font-semibold hover:bg-[#00f0ff]/80 transition-all"
          >
            Ок
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;