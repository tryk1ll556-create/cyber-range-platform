const API_URL = 'http://localhost:8000';

export const api = {
  // Анализ атаки
  analyzeAttack: async (attackData) => {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attackData)
    });
    return res.json();
  },

  // Статистика
  getStats: async () => {
    const res = await fetch(`${API_URL}/stats`);
    return res.json();
  },

  // Лента атак
  getTimeline: async () => {
    const res = await fetch(`${API_URL}/timeline`);
    return res.json();
  },

  // Дашборд (HTML)
  getDashboard: () => {
    return `${API_URL}/dashboard`;
  }
};