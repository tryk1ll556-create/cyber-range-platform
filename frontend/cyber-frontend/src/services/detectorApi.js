const DETECTOR_URL = 'http://localhost:8001';

export const detectorApi = {
  // Получить статистику
  getStats: async () => {
    const res = await fetch(`${DETECTOR_URL}/stats`);
    return res.json();
  },

  // Получить таймлайн атак
  getTimeline: async () => {
    const res = await fetch(`${DETECTOR_URL}/timeline`);
    return res.json();
  },

  // Отправить запрос на анализ
  analyze: async (method, url, params, sandboxId, attackerId = 'student') => {
    const res = await fetch(`${DETECTOR_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        url,
        params,
        sandbox_id: sandboxId,
        attacker_id: attackerId
      })
    });
    return res.json();
  },

  // Получить дашборд (iframe)
  getDashboard: () => `${DETECTOR_URL}/dashboard`
};