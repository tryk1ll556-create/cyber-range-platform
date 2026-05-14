const DETECTOR_URL = 'http://localhost:8001';

export const detectorApi = {
  getStats: async () => {
    const res = await fetch(`${DETECTOR_URL}/stats`);
    if (!res.ok) throw new Error('Ошибка загрузки статистики');
    return res.json();
  },

  getTimeline: async () => {
    const res = await fetch(`${DETECTOR_URL}/timeline`);
    if (!res.ok) throw new Error('Ошибка загрузки ленты атак');
    return res.json();
  },

  getDashboard: () => `${DETECTOR_URL}/dashboard`
};