import React, { useState } from 'react';
import { challenges } from '../../data/challenges';
import Spinner from '../common/Spinner';
import { useUser } from '../../context/UserContext';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  const { addXP, addCompletedChallenge } = useUser();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handleStart = (challengeId) => {
    onStartSandbox(challengeId);
    addXP(25);
    addCompletedChallenge(challengeId);
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesFilter = filter === 'all' || challenge.id === filter;
    const matchesSearch = challenge.name.toLowerCase().includes(search.toLowerCase()) ||
                          challenge.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'sqli', label: 'SQL Injection' },
    { id: 'xss', label: 'XSS' },
    { id: 'path_traversal', label: 'Path Traversal' }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff]">
        🎯 Доступные задания
      </h2>

      {/* Фильтры */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg font-mono transition-all ${
              filter === f.id
                ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
                : 'bg-[#1a2332] text-white hover:bg-[#2a3a5e]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="🔍 Поиск по названию или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-2 text-white focus:border-[#00f0ff] focus:outline-none"
        />
      </div>

      {/* Сетка заданий */}
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
            <p className="text-gray-400 text-sm mb-4 flex-1">{challenge.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-yellow-400 font-bold">🏆 {challenge.points} очков</span>
            </div>

            <button
              onClick={() => handleStart(challenge.id)}
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] 
                         px-4 py-2 rounded-lg font-mono font-semibold
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