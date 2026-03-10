import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Profile = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = {
    name: 'Хакер Студент',
    email: 'student@cyber.local',
    level: 7,
    xp: 2450,
    nextLevelXp: 3000,
    completedTasks: 12,
    rank: 'Белый хакер',
    badges: [
      { name: 'SQL Injection', icon: '🗃️' },
      { name: 'XSS Master', icon: '⚡' },
      { name: 'Path Traversal', icon: '📁' },
      { name: 'Recon', icon: '🔍' }
    ]
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      setLoading(true);
      api.getStats()
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      setLoading(true);
      api.getTimeline()
        .then(data => {
          setTimeline(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,240,255,0.2)] relative">
          
          {/* Кнопка назад на главную */}
          <Link
            to="/"
            className="absolute top-4 left-4 text-gray-400 hover:text-[#00f0ff] transition-all text-sm flex items-center gap-1"
          >
            ← На главную
          </Link>

          <h2 className="text-3xl font-bold text-center text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff] mb-6 mt-4">
            🔐 Вход в систему
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="student@cyber.local"
                className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-3 text-white focus:border-[#00f0ff] focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setIsAuthenticated(true)}
              className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-lg hover:bg-[#00f0ff]/80 transition-all shadow-[0_0_15px_#00f0ff]"
            >
              🚀 Войти
            </button>

            <div className="text-center text-gray-400 text-sm">
              Нет аккаунта?{' '}
              <button className="text-[#00f0ff] hover:underline">
                Зарегистрироваться
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a3a5e] text-center">
            <button
              onClick={() => setIsAuthenticated(true)}
              className="text-sm text-gray-500 hover:text-[#00f0ff] transition-all"
            >
              ⚡ Войти как гость (демо)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round((user.xp / user.nextLevelXp) * 100);

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

        <div className="bg-[#141b2b]/80 backdrop-blur-sm border border-[#2a3a5e] rounded-xl p-6 md:p-8 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-400 hover:text-[#ff3b9c] transition-all"
            >
              🚪 Выйти
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#1a2332] border-4 border-[#00f0ff] shadow-[0_0_20px_#00f0ff] flex items-center justify-center">
                <span className="text-4xl md:text-5xl">👨‍💻</span>
              </div>
              <button className="absolute bottom-0 right-0 bg-[#00f0ff] text-black rounded-full w-8 h-8 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                ✏️
              </button>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff] mb-2">
                {user.name}
              </h1>
              <p className="text-gray-400 mb-3">{user.email}</p>
              
              <div className="max-w-md">
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

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <span className="bg-[#1a2332] border border-[#2a3a5e] text-xs px-3 py-1 rounded-full">
                  🏆 {user.rank}
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
            { id: 'timeline', label: '⏱️ Лента атак' },
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
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">🏅 Достижения</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.badges.map((badge, i) => (
                  <div key={i} className="bg-[#1a2332] border border-[#2a3a5e] rounded-lg p-4 text-center hover:border-[#00f0ff] transition-all">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-bold text-[#00f0ff]">{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">📊 Статистика системы</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Загрузка...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3a5e] text-center">
                    <div className="text-3xl text-[#00f0ff] mb-2">{stats.total_requests}</div>
                    <div className="text-gray-400">Всего запросов</div>
                  </div>
                  <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3a5e] text-center">
                    <div className="text-3xl text-[#ff3b9c] mb-2">{stats.detected_attacks}</div>
                    <div className="text-gray-400">Атак обнаружено</div>
                  </div>
                  <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3a5e] text-center">
                    <div className="text-3xl text-[#00f0ff] mb-2">{stats.sql_injections}</div>
                    <div className="text-gray-400">SQL инъекции</div>
                  </div>
                  <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3a5e] text-center">
                    <div className="text-3xl text-[#00f0ff] mb-2">{stats.xss_attacks}</div>
                    <div className="text-gray-400">XSS атаки</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">Не удалось загрузить статистику</div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">⏱️ Лента атак</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Загрузка...</div>
              ) : timeline.length > 0 ? (
                <div className="space-y-3">
                  {timeline.map((attack, i) => (
                    <div key={i} className="bg-[#1a2332] border border-[#2a3a5e] rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-400">{attack.timestamp}</div>
                          <div className="font-bold text-white">{attack.attacker_id}</div>
                          <div className="text-xs text-gray-400">{attack.ip_address}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          attack.risk === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'
                        }`}>
                          {attack.risk}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {attack.detections.map((detection, j) => (
                          <span key={j} className="text-xs bg-[#00f0ff] text-black px-2 py-1 rounded">
                            {detection}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">Нет данных об атаках</div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">📈 Дашборд безопасности</h2>
              <iframe
                src={api.getDashboard()}
                className="w-full h-[600px] rounded-lg border border-[#2a3a5e]"
                title="SOC Dashboard"
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold text-[#00f0ff] mb-4">⚙️ Настройки</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#2a3a5e]">
                  <span>Тёмная тема</span>
                  <span className="text-[#00f0ff]">✅</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#2a3a5e]">
                  <span>Уведомления</span>
                  <span className="text-[#00f0ff]">✅</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#2a3a5e]">
                  <span>Двухфакторная аутентификация</span>
                  <span className="text-gray-400">❌</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;