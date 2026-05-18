import React, { useState, useEffect } from 'react';
import { challenges } from '../../data/challenges';
import Spinner from '../common/Spinner';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  const { user, addXP, addCompletedChallenge, updateUser } = useUser();
  const { isDark } = useTheme();
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

  const filteredChallenges = challenges.filter(challenge => {
    if (filterType !== 'all' && challenge.type !== filterType) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return challenge.name.toLowerCase().includes(searchLower) ||
             challenge.description.toLowerCase().includes(searchLower);
    }
    return true;
  });

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
      <div className={`rounded-xl p-6 mb-6 text-center shadow-lg transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-[#0f1625] via-[#141b2b] to-[#0f1625] border border-[#2a3a5e]' 
          : 'bg-gradient-to-br from-gray-100 via-white to-gray-100 border border-gray-300'
      }`}>
        <h2 className={`text-2xl md:text-4xl font-bold tracking-wide mb-2 ${
          isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'
        }`}>
          Добро пожаловать, {userName}!
        </h2>
        <p className={`text-sm md:text-base ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {localUser 
            ? 'Запускай задания → Атакуй песочницы → Повышай уровень'
            : 'Войдите в систему, чтобы начать обучение'}
        </p>
      </div>

      {/* Прогресс-бар */}
      {showProgressBar && localUser && (
        <div className={`rounded-xl p-4 mb-8 shadow-md transition-all duration-300 ${
          isDark 
            ? 'bg-[#141b2b] border border-[#2a3a5e]' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              📊 Прогресс до следующего уровня
            </span>
            <span className={`text-sm font-mono ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
              {localUser.xp} / {localUser.nextLevelXp} XP
            </span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#1a2332]' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff3b9c] rounded-full transition-all duration-500"
              style={{ width: `${Math.round((localUser.xp / localUser.nextLevelXp) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Текущий ранг: {localUser.rank}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Следующий ранг: {getNextRank()}
            </span>
          </div>
        </div>
      )}

      {/* Заголовок + поиск */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-3xl font-bold text-center md:text-left ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
          🎯 Доступные задания
        </h2>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="🔍 Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-lg px-4 py-2 focus:outline-none transition-all ${
              isDark
                ? 'bg-[#1a2332] border border-[#2a3a5e] text-white placeholder-gray-500 focus:border-[#00f0ff]'
                : 'bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#0891b2]'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
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
                ? isDark
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
                  : 'bg-[#0891b2] text-white shadow-md'
                : isDark
                  ? 'bg-[#1a2332] text-gray-300 border border-[#2a3a5e] hover:border-[#00f0ff] hover:text-[#00f0ff]'
                  : 'bg-gray-200 text-gray-700 border border-gray-300 hover:border-[#0891b2] hover:text-[#0891b2]'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Результаты фильтрации */}
      {filteredChallenges.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${
          isDark 
            ? 'bg-[#141b2b] border-[#2a3a5e]' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={`text-xl mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Ничего не найдено
          </h3>
          <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            Попробуй изменить поиск или фильтр
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
            <div
              key={challenge.id}
              className={`rounded-xl p-6 transition-all duration-300 flex flex-col ${
                isDark 
                  ? 'bg-[#141b2b] border border-[#2a3a5e] hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                  : 'bg-white border border-gray-200 hover:border-[#0891b2] hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{challenge.icon}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark 
                    ? 'bg-[#1a2332] border border-[#2a3a5e] text-gray-300' 
                    : 'bg-gray-100 border border-gray-300 text-gray-600'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                {challenge.name}
              </h3>
              <p className={`text-sm mb-3 flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {challenge.description}
              </p>

              <div className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                👥 Выполнили: {challenge.completedCount || 0} раз
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-500 font-bold">🏆 {challenge.points} очков</span>
              </div>

              <button
                onClick={() => handleStart(challenge.id)}
                disabled={isLoading || !localUser}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black'
                    : 'bg-[#0891b2] text-white hover:bg-[#0e7c9e] border-none'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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