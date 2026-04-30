import React from 'react';
import { challenges } from '../../data/challenges';
import Spinner from '../common/Spinner';
import { useUser } from '../../context/UserContext';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  const { addXP, addCompletedChallenge } = useUser();

  let userName = 'Хакер';
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      userName = parsed.username || parsed.name || 'Хакер';
    }
  } catch (e) {
    console.error('Ошибка чтения пользователя:', e);
  }

  const handleStart = (challengeId) => {
    onStartSandbox(challengeId);
    addXP(25);
    addCompletedChallenge(challengeId);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Баннер-приветствие */}
      <div className="bg-gradient-to-br from-[#0f1625] via-[#141b2b] to-[#0f1625] border border-[#2a3a5e] rounded-xl p-6 mb-10 text-center shadow-lg">
        <h2 className="text-2xl md:text-4xl font-bold text-[#00f0ff] tracking-wide mb-2">
          Добро пожаловать, {userName}!
        </h2>
        <p className="text-gray-300 text-sm md:text-base">
          Запускай задания → Атакуй песочницы → Повышай уровень
        </p>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8 text-[#00f0ff]">
        🎯 Доступные задания
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(challenge => (
          <div
            key={challenge.id}
            className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-6 
                       hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] 
                       transition-all duration-300 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{challenge.icon}</span>
              <span className="text-xs bg-[#1a2332] border border-[#2a3a5e] px-3 py-1 rounded-full">
                {challenge.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#00f0ff] mb-2">{challenge.name}</h3>
            <p className="text-gray-400 text-sm mb-4 flex-1">{challenge.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-yellow-400 font-bold">🏆 {challenge.points} очков</span>
            </div>

            <button
              onClick={() => handleStart(challenge.id)}
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] 
                         px-4 py-2 rounded-lg font-semibold
                         hover:bg-[#00f0ff] hover:text-black 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="w-4 h-4" />
                  <span>Запуск...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Начать задание</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChallengesList;