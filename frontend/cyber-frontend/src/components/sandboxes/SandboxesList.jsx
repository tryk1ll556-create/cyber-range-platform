import React from 'react';

const getChallengeName = (type) => {
  const names = {
    sqli: 'SQL Injection',
    xss: 'XSS Attack',
    rce: 'Remote Code Execution',
    path_traversal: 'Path Traversal'
  };
  return names[type] || type;
};

const SandboxesList = ({ sandboxes, onStopSandbox }) => {
  if (sandboxes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🖥️</div>
        <h3 className="text-2xl font-bold text-gray-400 mb-2">Нет активных песочниц</h3>
        <p className="text-gray-500">Запусти задание, чтобы начать обучение</p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff]">
        🖥️ Активные песочницы
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sandboxes.map(sandbox => (
          <div
            key={sandbox.sandbox_id}
            className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-6 
                       hover:border-[#00f0ff] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#00f0ff]">
                  Песочница #{sandbox.sandbox_id?.slice(-4) || '???'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Тип: {getChallengeName(sandbox.challenge_type)}
                </p>
              </div>
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                🟢 Запущена
              </span>
            </div>

            <div className="text-sm text-gray-400 mb-4">
              Запущена: {sandbox.created_at 
                ? new Date(sandbox.created_at).toLocaleTimeString() 
                : 'только что'}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.open(sandbox.url, '_blank')}
                className="flex-1 bg-[#00f0ff] text-black text-center px-4 py-2 rounded-lg 
                           font-mono font-semibold hover:bg-[#00f0ff]/80 
                           transition-all duration-300 cursor-pointer"
              >
                🔗 Перейти
              </button>
              <button
                onClick={() => onStopSandbox(sandbox.sandbox_id)}
                className="px-4 py-2 rounded-lg border-2 border-[#ff3b9c] text-[#ff3b9c] 
                           hover:bg-[#ff3b9c] hover:text-black 
                           transition-all duration-300 cursor-pointer"
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