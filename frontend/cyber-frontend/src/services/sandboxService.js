import { backendApi } from './backendApi';

export const sandboxService = {
  start: async (challengeType, userId) => {
    // Создаём песочницу с типом задания и привязываем к пользователю
    const createResult = await backendApi.createSandbox(
      `Задание: ${challengeType}`,
      'webapp',
      'beginner',
      userId || 'guest'
    );
    
    console.log('🔥 Создание песочницы:', createResult);
    
    if (!createResult.id) {
      throw new Error('Не удалось создать песочницу');
    }
    
    // Запускаем песочницу
    const startResult = await backendApi.startSandbox(createResult.id);
    console.log('🔥 Запуск песочницы:', startResult);
    
    return {
      sandbox_id: createResult.id,
      challenge_type: challengeType,
      status: startResult.status || 'running',
      url: startResult.url,
      created_at: createResult.created_at
    };
  },

  stop: async (sandboxId) => {
    const result = await backendApi.stopSandbox(sandboxId);
    console.log('🛑 Остановка песочницы:', result);
    return result;
  },

  getAll: async (userId) => {
    const data = await backendApi.getAllSandboxes(userId);
    console.log('📋 Данные с бекенда:', data);
    
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