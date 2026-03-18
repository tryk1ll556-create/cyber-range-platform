import { backendApi } from './backendApi';

export const sandboxService = {
  start: async (challengeType) => {
    // Создаём песочницу с типом задания
    const result = await backendApi.createSandbox(
      `Задание: ${challengeType}`,
      'webapp',
      'beginner'
    );
    
    console.log('🔥 Создание песочницы:', result);
    
    // Запускаем
    if (result.id) {
      const startResult = await backendApi.startSandbox(result.id);
      console.log('🔥 Запуск песочницы:', startResult);
      
      return {
        sandbox_id: result.id,
        challenge_type: challengeType,
        status: 'running',
        url: result.url,
        created_at: result.created_at
      };
    }
    throw new Error('Не удалось создать песочницу');
  },

  stop: async (sandboxId) => {
    const result = await backendApi.stopSandbox(sandboxId);
    console.log('🛑 Остановка песочницы:', result);
    return result;
  },

  getAll: async () => {
    const data = await backendApi.getAllSandboxes();
    console.log('📋 Данные с бекенда:', data);
    
    // Преобразуем в формат, который ждёт твой фронт
    return data.map(s => ({
      sandbox_id: s.id,
      challenge_type: s.type,
      status: s.status,
      url: s.url,
      created_at: s.created_at
    }));
  },

  getLogs: async (sandboxId) => {
    return backendApi.getLogs(sandboxId);
  }
};