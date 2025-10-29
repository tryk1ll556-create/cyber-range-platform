// Заглушка API - потом заменим на реальное
export const sandboxService = {
    start: async (challengeType) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        sandbox_id: `sandbox_${Date.now()}`,
        url: 'http://localhost:8080',
        challenge_type: challengeType,
        status: 'running',
        created_at: new Date().toISOString()
      };
    },
  
    stop: async (sandboxId) => {
      return { success: true };
    }
  };