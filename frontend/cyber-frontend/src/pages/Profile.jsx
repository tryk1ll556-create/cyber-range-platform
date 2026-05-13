import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { detectorApi } from '../services/detectorApi';
import AttackFeed from '../components/AttackFeed';
import AchievementsList from '../components/AchievementsList';
import Settings from '../components/Settings';

// Мок-данные для статистики (если детектор не отвечает)
const mockStats = {
  total_requests: 127,
  detected_attacks: 89,
  sql_injections: 34,
  xss_attacks: 28,
  path_traversals: 15
};

const Profile = () => {
  const { user, updateUser, resetUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingMockStats, setUsingMockStats] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') !== 'false';
  });

  // Загрузка статистики с мок-данными
  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await detectorApi.getStats();
      if (data && typeof data.total_requests !== 'undefined') {
        setStats(data);
        setUsingMockStats(false);
      } else {
        setStats(mockStats);
        setUsingMockStats(true);
      }
    } catch (err) {
      console.warn('Детектор не отвечает, показываем тестовую статистику');
      setStats(mockStats);
      setUsingMockStats(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
      const interval = setInterval(loadStats, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const progress = Math.round((user.xp / user.nextLevelXp) * 100);

  const StatCard = ({ label, value }) => (
    <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3a5e] text-center">
      <div className="text-2xl font-bold text-[#00f0ff] mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );

  // Проверка авторизации
  if (!localStorage.getItem('userId')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#1a2332] border border-[#2a3a5e] text-white px-4 py-2 rounded-lg hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
          >
            ← На главную
          </Link>
        </div>

        <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-6 md:p-8 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                localStorage.removeItem('userId');
                localStorage.removeItem('user');
                resetUser();
              }}
              className="text-sm text-gray-400 hover:text-[#ff3b9c] transition-all"
            >
              🚪 Выйти
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#1a2332] border-4 border-[#00f0ff] shadow-[0_0_20px_#00f0ff] flex items-center justify-center">
              <span className="text-4xl md:text-5xl">{localStorage.getItem('avatar') || '👨‍💻'}</span>
            </div>

            <div className="text-center md:text-left flex-1 w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff] mb-2">
                {user.name}
              </h1>
              <p className="text-gray-400 mb-3">{user.email}</p>
              
              <div className="max-w-md mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#00f0ff]">Уровень {user.level}</span>
                  <span className="text-gray-400">{user.xp} / {user.nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2 bg-[#1a2332] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff3b9c] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-[#1a2332] border border-[#2a3a5e] text-xs px-3 py-1 rounded-full">
                  🏆 {user.rank}
                </span>
                <span className="bg-[#1a2332] border border-[#2a3a5e] text-xs px-3 py-1 rounded-full">
                  📊 Уровень {user.level}
                </span>
                <span className="bg-[#1a2332] border border-[#2a3a5e] text-xs px-3 py-1 rounded-full">
                  ✅ {user.completedTasks} заданий
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[#2a3a5e] pb-2 overflow-x-auto">
          {[
            { id: 'profile', label: '👤 Профиль' },
            { id: 'badges', label: '🏅 Достижения' },
            { id: 'stats', label: '📊 Статистика' },
            { id: 'feed', label: '⚡ Лента атак' },
            { id: 'dashboard', label: '📈 Дашборд' },
            { id: 'settings', label: '⚙️ Настройки' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-mono transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
                  : 'text-white hover:bg-[#2a3a5e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">👤 О себе</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3a5e]">
                  <div className="text-gray-400 text-sm">Специализация</div>
                  <div className="text-white font-bold">Web Security</div>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3a5e]">
                  <div className="text-gray-400 text-sm">Опыт</div>
                  <div className="text-white font-bold">8 месяцев</div>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3a5e]">
                  <div className="text-gray-400 text-sm">Команда</div>
                  <div className="text-white font-bold">Red Team</div>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3a5e]">
                  <div className="text-gray-400 text-sm">Рейтинг</div>
                  <div className="text-white font-bold">#156</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">🏅 Мои достижения</h2>
              {user.badges.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Пока нет достижений. Выполняй задания, чтобы получить их!
                </div>
              ) : (
                <AchievementsList 
                  userBadges={user.badges} 
                  userStats={{
                    completedTasks: user.completedTasks,
                    level: user.level,
                    challengesCompleted: user.challengesCompleted
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#00f0ff]">📊 Статистика детектора</h2>
                {usingMockStats && !loading && (
                  <span className="text-xs bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded">
                    ⚠️ Демо-режим
                  </span>
                )}
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Загрузка...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard label="Всего запросов" value={stats.total_requests} />
                  <StatCard label="Обнаружено атак" value={stats.detected_attacks} />
                  <StatCard label="SQL инъекции" value={stats.sql_injections} />
                  <StatCard label="XSS атаки" value={stats.xss_attacks} />
                  <StatCard label="Path Traversal" value={stats.path_traversals} />
                  <StatCard 
                    label="Соотношение атак" 
                    value={`${stats.detected_attacks && stats.total_requests 
                      ? ((stats.detected_attacks / stats.total_requests) * 100).toFixed(1) 
                      : 0}%`} 
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  ❌ Не удалось загрузить статистику. Проверь, запущен ли детектор на порту 8001.
                </div>
              )}
              {usingMockStats && !loading && (
                <div className="mt-4 text-xs text-center text-yellow-400">
                  ⚡ Отображаются тестовые данные. Запусти детектор на порту 8001 для реальной статистики.
                </div>
              )}
            </div>
          )}

          {activeTab === 'feed' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">⚡ Лента атак</h2>
              <AttackFeed limit={15} />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">📈 Дашборд безопасности</h2>
              <iframe
                src={detectorApi.getDashboard()}
                className="w-full h-[600px] rounded-lg border border-[#2a3a5e]"
                title="SOC Dashboard"
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <Settings
              user={user}
              updateUser={updateUser}
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={setNotificationsEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;