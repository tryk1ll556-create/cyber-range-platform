import React, { useState, useEffect } from 'react';
import Toast from './common/Toast';

const Settings = ({ user, updateUser, notificationsEnabled, setNotificationsEnabled }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '👨‍💻');
  const [tempNotifications, setTempNotifications] = useState(notificationsEnabled);
  const [toast, setToast] = useState(null);

  const avatars = ['👨‍💻', '👩‍💻', '🧑‍💻', '🤖', '🦸', '🦹', '🐱‍👤', '🔥', '💀', '👾'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    updateUser({ ...user, name, full_name: name });
    localStorage.setItem('avatar', avatar);
    setNotificationsEnabled(tempNotifications);
    showToast('Настройки сохранены!', 'success');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#00f0ff] mb-4">⚙️ Настройки профиля</h2>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Имя</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-2 text-white focus:border-[#00f0ff] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2">Аватар</label>
        <div className="flex flex-wrap gap-3">
          {avatars.map((ava) => (
            <button
              key={ava}
              onClick={() => setAvatar(ava)}
              className={`text-3xl p-2 rounded-lg transition-all ${
                avatar === ava ? 'bg-[#00f0ff] text-black scale-110' : 'bg-[#1a2332] hover:bg-[#2a3a5e]'
              }`}
            >
              {ava}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#2a3a5e]">
        <span className="text-white">🔔 Показывать уведомления о достижениях</span>
        <button
          onClick={() => setTempNotifications(!tempNotifications)}
          className={`px-4 py-2 rounded-lg transition-all ${
            tempNotifications ? 'bg-[#00f0ff] text-black' : 'bg-[#2a3a5e] text-gray-400'
          }`}
        >
          {tempNotifications ? 'Вкл' : 'Выкл'}
        </button>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Новый пароль</label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full bg-[#1a2332] border border-[#2a3a5e] rounded-lg px-4 py-2 text-white focus:border-[#00f0ff] focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Пока не подключено к серверу</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-lg hover:bg-[#00f0ff]/80 transition-all"
      >
        💾 Сохранить настройки
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;