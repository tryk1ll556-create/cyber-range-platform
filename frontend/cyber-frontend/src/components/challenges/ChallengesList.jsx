import React, { useState, useEffect } from 'react';
import { challenges } from '../../data/challenges';
import Spinner from '../common/Spinner';
import { useUser } from '../../context/UserContext';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  const { user, addXP, addCompletedChallenge, updateUser } = useUser();
  const [localUser, setLocalUser] = useState(user);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Фильтрация и поиск заданий
  const filteredChallenges = challenges.filter(challenge => {
    // Фильтр по типу
    if (filterType !== 'all' && challenge.type !== filterType) return false;
    // Поиск по названию и описанию
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return challenge.name.toLowerCase().includes(searchLower) ||
             challenge.description.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Уникальные типы для фильтров
  const filterOptions = [
    { id: 'all', label: 'Все', icon: '📋' },
    { id: 'sqli', label: 'SQL Injection', icon: '🗃️' },
    { id: 'xss', label: 'XSS', icon: '⚡' },
    { id: 'null_byte', label: 'Null Byte', icon: '💉' },
    { id: 'path_traversal', label: 'Path Traversal', icon: '📁' }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Баннер-приветствие */}
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

      {/* Прогресс-бар */}
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
            <span className="text-xs text-gray-500">Следующий ранг: {getNextRank()}</span>
          </div>
        </div>
      )}

      {/* Заголовок + поиск */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-center md:text-left text-[#00f0ff]">
          🎯 Доступные задания
        </h2>
        
        {/* Поле поиска */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="🔍 Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {filterOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setFilterType(option.id)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 ${
              filterType === option.id
                ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
                : 'bg-[#1a2332] text-gray-300 border border-[#2a3a5e] hover:border-[#00f0ff] hover:text-[#00f0ff]'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Результаты фильтрации */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-[#141b2b] rounded-xl border border-[#2a3a5e]">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl text-gray-400 mb-2">Ничего не найдено</h3>
          <p className="text-gray-500">Попробуй изменить поиск или фильтр</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
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
      )}
    </section>
  );
};

export default ChallengesList;