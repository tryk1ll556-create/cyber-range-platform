const BACKEND_URL = 'http://localhost:8000';

export const backendApi = {
  // Создать песочницу
  createSandbox: async (name, type, difficulty, ownerId = 'student') => {
    const res = await fetch(`${BACKEND_URL}/sandboxes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, difficulty, owner_id: ownerId })
    });
    return res.json();
  },

  // Все песочницы
  getAllSandboxes: async () => {
    const res = await fetch(`${BACKEND_URL}/sandboxes`);
    return res.json();
  },

  // Одна песочница
  getSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}`);
    return res.json();
  },

  // Запустить
  startSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}/start`, {
      method: 'POST'
    });
    return res.json();
  },

  // Остановить
  stopSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}/stop`, {
      method: 'POST'
    });
    return res.json();
  },

  // Удалить
  deleteSandbox: async (id) => {
    const res = await fetch(`${BACKEND_URL}/sandboxes/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Логи
  getLogs: async (sandboxId) => {
    const res = await fetch(`${BACKEND_URL}/logs/sandbox/${sandboxId}`);
    return res.json();
  },

  // Регистрация
  register: async (username, email, password, fullName = '') => {
    const res = await fetch(`${BACKEND_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name: fullName })
    });
    return res.json();
  },

  // Получить пользователя
  getUser: async (id) => {
    const res = await fetch(`${BACKEND_URL}/users/${id}`);
    return res.json();
  }
};