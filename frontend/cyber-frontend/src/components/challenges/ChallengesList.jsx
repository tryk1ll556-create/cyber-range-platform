import React, { useState, useEffect } from 'react';
import { challenges } from '../../data/challenges';
import Spinner from '../common/Spinner';
import { useUser } from '../../context/UserContext';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  const { user, addXP, addCompletedChallenge, updateUser } = useUser();
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const userName = localUser?.name || 'Гость';
  const showProgressBar = localUser !== null;

  const getNextRank = () => {
    if (!localUser) return 'Авторизуйтесь';
    if (localUser.rank === 'Новичок') return 'Белый хакер';
    if (localUser.rank === 'Белый хакер') return 'Хакер';
    if (localUser.rank === 'Хакер') return 'Эксперт';
    if (localUser.rank === 'Эксперт') return 'Мастер';
    return 'Мастер';
  };

  const handleStart = async (challengeId) => {
    if (!localUser) {
      alert('Необходимо авторизоваться');
      return;
    }
    await onStartSandbox(challengeId);
    addXP(25);
    addCompletedChallenge(challengeId);
    
    setTimeout(() => {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          updateUser(parsed);
        } catch(e) {}
      }
    }, 100);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-[#0f1625] via-[#141b2b] to-[#0f1625] border border-[#2a3a5e] rounded-xl p-6 mb-6 text-center shadow-lg">
        <h2 className="text-2xl md:text-4xl font-bold text-[#00f0ff] tracking-wide mb-2">
          Добро пожаловать, {userName}!
        </h2>
        <p className="text-gray-300 text-sm md:text-base">
          {localUser 
            ? 'Запускай задания → Атакуй песочницы → Повышай уровень'
            : 'Войдите в систему, чтобы начать обучение'}
        </p>
      </div>

      {showProgressBar && localUser && (
        <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-4 mb-8 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">📊 Прогресс до следующего уровня</span>
            <span className="text-sm text-[#00f0ff] font-mono">
              {localUser.xp} / {localUser.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-3 bg-[#1a2332] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff3b9c] rounded-full transition-all duration-500"
              style={{ width: `${Math.round((localUser.xp / localUser.nextLevelXp) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">Текущий ранг: {localUser.rank}</span>
            <span className="text-xs text-gray-500">
              Следующий ранг: {getNextRank()}
            </span>
          </div>
        </div>
      )}

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
            <p className="text-gray-400 text-sm mb-3 flex-1">{challenge.description}</p>

            <div className="text-xs text-gray-500 mb-3">
              👥 Выполнили: {challenge.completedCount || 0} раз
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-yellow-400 font-bold">🏆 {challenge.points} очков</span>
            </div>

            <button
              onClick={() => handleStart(challenge.id)}
              disabled={isLoading || !localUser}
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