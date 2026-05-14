import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const getChallengeName = (type) => {
  const names = {
    sqli: 'SQL Injection',
    xss: 'XSS Attack',
    rce: 'Remote Code Execution',
    path_traversal: 'Path Traversal',
    null_byte: 'Poison Null Byte'
  };
  return names[type] || type;
};

const SandboxesList = ({ sandboxes, onStopSandbox }) => {
  const { isDark } = useTheme();

  if (sandboxes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🖥️</div>
        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Нет активных песочниц
        </h3>
        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
          Запусти задание, чтобы начать обучение
        </p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className={`text-3xl font-bold text-center mb-8 ${
        isDark ? 'text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff]' : 'text-[#0891b2]'
      }`}>
        🖥️ Активные песочницы
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sandboxes.map(sandbox => (
          <div
            key={sandbox.sandbox_id}
            className={`rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] ${
              isDark
                ? 'bg-gradient-to-br from-[#141b2b] to-[#0f1625] border border-[#2a3a5e] hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-white border border-gray-200 hover:border-[#0891b2] hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-bold ${
                  isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'
                }`}>
                  Песочница #{sandbox.sandbox_id?.slice(-4) || '???'}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Тип: {getChallengeName(sandbox.challenge_type)}
                </p>
              </div>
              <span className="bg-green-600/20 text-green-600 text-xs px-3 py-1 rounded-full border border-green-500/30">
                🟢 Запущена
              </span>
            </div>

            <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Запущена: {sandbox.created_at 
                ? new Date(sandbox.created_at).toLocaleTimeString() 
                : 'только что'}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.open(sandbox.url, '_blank')}
                className={`flex-1 font-bold text-center px-4 py-2 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-[#00f0ff] text-black hover:bg-[#00f0ff]/80'
                    : 'bg-[#0891b2] text-white hover:bg-[#0e7c9e]'
                }`}
              >
                🔗 Перейти
              </button>
              <button
                onClick={() => onStopSandbox(sandbox.sandbox_id)}
                className={`px-5 py-2 rounded-xl border-2 transition-all duration-300 ${
                  isDark
                    ? 'border-[#ff3b9c] text-[#ff3b9c] hover:bg-[#ff3b9c] hover:text-black'
                    : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
                }`}
              >
                🛑 Стоп
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SandboxesList;