const BACKEND_URL = 'http://localhost:8000';

export const backendApi = {
  // Песочницы
  createSandbox: async (name, type, difficulty, ownerId = 'guest') => {
    const res = await fetch(`${BACKEND_URL}/sandboxes?owner_id=${ownerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, difficulty })
    });
    if (!res.ok) throw new Error('Ошибка создания песочницы');
    return res.json();
  },

  getAllSandboxes: async (ownerId = null) => {
    let url = `${BACKEND_URL}/sandboxes`;
    if (ownerId) {
      url += `?owner_id=${ownerId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка получения списка песочниц');
    return res.json();
  },

  getSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}`);
    if (!res.ok) throw new Error('Песочница не найдена');
    return res.json();
  },

  startSandbox: async (id, userId) => {
    const url = userId 
      ? `${BACKEND_URL}/sandboxes/${id}/start?user_id=${userId}`
      : `${BACKEND_URL}/sandboxes/${id}/start`;
    const res = await fetch(url, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Ошибка запуска песочницы');
    return res.json();
},

  stopSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}/stop`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Ошибка остановки песочницы');
    return res.json();
  },

  deleteSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Ошибка удаления песочницы');
    return res.json();
  },

  // Логи
  getLogs: async (sandboxId) => {
    const res = await fetch(`${BACKEND_URL}/logs/sandbox/${sandboxId}`);
    if (!res.ok) throw new Error('Ошибка получения логов');
    return res.json();
  },

  // Пользователи
  register: async (username, email, password, fullName = '') => {
    const res = await fetch(`${BACKEND_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name: fullName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ошибка регистрации');
    }
    return res.json();
  },

  login: async (username, password) => {
    const res = await fetch(`${BACKEND_URL}/login?username=${username}&password=${password}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Неверное имя пользователя или пароль');
    }
    return res.json();
  },

  getUser: async (id) => {
    const res = await fetch(`${BACKEND_URL}/users/${id}`);
    if (!res.ok) throw new Error('Пользователь не найден');
    return res.json();
  },

  getUserProgress: async (id) => {
    const res = await fetch(`${BACKEND_URL}/users/${id}/progress`);
    if (!res.ok) throw new Error('Ошибка получения прогресса');
    return res.json();
  },

  getLeaderboard: async () => {
    const res = await fetch(`${BACKEND_URL}/leaderboard`);
    if (!res.ok) throw new Error('Ошибка получения лидерборда');
    return res.json();
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const res = await fetch(`${BACKEND_URL}/users/change-password?user_id=${userId}&old_password=${oldPassword}&new_password=${newPassword}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ошибка смены пароля');
    }
    return res.json();
  }
};