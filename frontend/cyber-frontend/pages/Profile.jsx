import React from 'react';

const Profile = () => {
  const user = {
    name: 'Хакер Студент',
    email: 'student@cyber.local',
    level: 7,
    points: 2450,
    completedTasks: 12,
    rank: 'Белый хакер',
    badges: ['SQL Injection', 'XSS Master', 'Recon']
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="cyber-card mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-[#2a3a5e] flex items-center justify-center border-4 border-[#00f0ff] shadow-[0_0_20px_#00f0ff]">
              <span className="text-4xl">👨‍💻</span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold cyber-text-neon mb-2">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex gap-4 mt-2">
                <span className="bg-[#1a2332] px-3 py-1 rounded-full text-sm border border-[#2a3a5e]">
                  🏆 {user.rank}
                </span>
                <span className="bg-[#1a2332] px-3 py-1 rounded-full text-sm border border-[#2a3a5e]">
                  📊 Уровень {user.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="cyber-card text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold cyber-text-neon">{user.points}</div>
            <div className="text-gray-400">Всего очков</div>
          </div>
          
          <div className="cyber-card text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold cyber-text-neon">{user.completedTasks}</div>
            <div className="text-gray-400">Выполнено заданий</div>
          </div>
          
          <div className="cyber-card text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold cyber-text-neon">{Math.round(user.completedTasks / 3)}</div>
            <div className="text-gray-400">Атак обнаружено</div>
          </div>
        </div>

        <div className="cyber-card">
          <h2 className="text-xl font-bold cyber-text-neon mb-4">🏅 Достижения</h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge, i) => (
              <span key={i} className="bg-[#1a2332] border border-[#00f0ff] text-[#00f0ff] px-4 py-2 rounded-full text-sm">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;