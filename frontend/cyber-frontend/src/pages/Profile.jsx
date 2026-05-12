import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { detectorApi } from '../services/detectorApi';
import AttackFeed from '../components/AttackFeed';
import AchievementsList from '../components/AchievementsList';
import Settings from '../components/Settings';

// Mock-данные для статистики (если детектор не отвечает)
const mockStats = {
  total_requests: 127,
  detected_attacks: 89,
  sql_injections: 34,
  xss_attacks: 28,
  path_traversals: 15
};

const Profile = () => {
  const { user, updateUser, resetUser } = useUser();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
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
        setUsingMock(false);
      } else {
        setStats(mockStats);
        setUsingMock(true);
      }
    } catch (err) {
      console.warn('Детектор не отвечает, показываем тестовую статистику');
      setStats(mockStats);
      setUsingMock(true);
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
    <div className={`p-4 rounded-lg border text-center transition-all ${
      isDark 
        ? 'bg-[#1a2332] border-[#2a3a5e]' 
        : 'bg-gray-100 border-gray-300'
    }`}>
      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
        {value}
      </div>
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </div>
    </div>
  );

  // Проверка авторизации
  if (!localStorage.getItem('userId')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-all duration-300 ${
      isDark ? 'bg-[#0a0f1e]' : 'bg-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-4">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isDark
                ? 'bg-[#1a2332] border border-[#2a3a5e] text-white hover:border-[#00f0ff] hover:text-[#00f0ff]'
                : 'bg-gray-200 border border-gray-300 text-gray-700 hover:border-[#0891b2] hover:text-[#0891b2]'
            }`}
          >
            ← На главную
          </Link>
        </div>

        {/* Профиль-карточка */}
        <div className={`rounded-xl p-6 md:p-8 mb-6 transition-all ${
          isDark 
            ? 'bg-[#141b2b] border border-[#2a3a5e] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                localStorage.removeItem('userId');
                localStorage.removeItem('user');
                resetUser();
              }}
              className={`text-sm transition-all ${
                isDark ? 'text-gray-400 hover:text-[#ff3b9c]' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              🚪 Выйти
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center transition-all ${
              isDark
                ? 'bg-[#1a2332] border-[#00f0ff] shadow-[0_0_20px_#00f0ff]'
                : 'bg-gray-100 border-[#0891b2] shadow-md'
            }`}>
              <span className="text-4xl md:text-5xl">{localStorage.getItem('avatar') || '👨‍💻'}</span>
            </div>

            <div className="text-center md:text-left flex-1 w-full">
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
                isDark ? 'text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]' : 'text-[#0891b2]'
              }`}>
                {user.name}
              </h1>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              
              <div className="max-w-md mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}>Уровень {user.level}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {user.xp} / {user.nextLevelXp} XP
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-[#1a2332]' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff3b9c] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark 
                    ? 'bg-[#1a2332] border border-[#2a3a5e] text-gray-300'
                    : 'bg-gray-100 border border-gray-300 text-gray-600'
                }`}>
                  🏆 {user.rank}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark 
                    ? 'bg-[#1a2332] border border-[#2a3a5e] text-gray-300'
                    : 'bg-gray-100 border border-gray-300 text-gray-600'
                }`}>
                  📊 Уровень {user.level}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark 
                    ? 'bg-[#1a2332] border border-[#2a3a5e] text-gray-300'
                    : 'bg-gray-100 border border-gray-300 text-gray-600'
                }`}>
                  ✅ {user.completedTasks} заданий
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className={`flex gap-2 mb-6 pb-2 overflow-x-auto border-b ${
          isDark ? 'border-[#2a3a5e]' : 'border-gray-300'
        }`}>
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
                  ? isDark
                    ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
                    : 'bg-[#0891b2] text-white shadow-md'
                  : isDark
                    ? 'text-white hover:bg-[#2a3a5e]'
                    : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Контент вкладок */}
        <div className={`rounded-xl p-6 transition-all ${
          isDark 
            ? 'bg-[#141b2b] border border-[#2a3a5e]'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                👤 О себе
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1a2332] border-[#2a3a5e]' : 'bg-gray-100 border-gray-300'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Специализация</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Web Security</div>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1a2332] border-[#2a3a5e]' : 'bg-gray-100 border-gray-300'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Опыт</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>8 месяцев</div>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1a2332] border-[#2a3a5e]' : 'bg-gray-100 border-gray-300'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Команда</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Red Team</div>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1a2332] border-[#2a3a5e]' : 'bg-gray-100 border-gray-300'
                }`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Рейтинг</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>#156</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                🏅 Мои достижения
              </h2>
              {user.badges.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <h2 className={`text-xl font-bold ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                  📊 Статистика детектора
                </h2>
                {usingMock && !loading && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDark ? 'bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    ⚠️ Демо-режим
                  </span>
                )}
              </div>
              {loading ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Загрузка...
                </div>
              ) : stats ? (
                <>
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
                  {usingMock && (
                    <div className={`mt-4 text-xs text-center ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      ⚡ Отображаются тестовые данные. Запусти детектор на порту 8001 для реальной статистики.
                    </div>
                  )}
                </>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ❌ Не удалось загрузить статистику.
                </div>
              )}
            </div>
          )}

          {activeTab === 'feed' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                ⚡ Лента атак
              </h2>
              <AttackFeed limit={15} />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
                📈 Дашборд безопасности
              </h2>
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