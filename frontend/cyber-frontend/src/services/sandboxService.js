import { backendApi } from './backendApi';

export const sandboxService = {
  start: async (challengeType) => {
    // Создаём песочницу с типом задания
    const result = await backendApi.createSandbox(
      `Задание: ${challengeType}`,
      'webapp',
      'beginner'
    );
    
    // Если создалась — запускаем
    if (result.id) {
      await backendApi.startSandbox(result.id);
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
    return backendApi.stopSandbox(sandboxId);
  },

  getAll: async () => {
    return backendApi.getAllSandboxes();
  },

  getLogs: async (sandboxId) => {
    return backendApi.getLogs(sandboxId);
  }
};