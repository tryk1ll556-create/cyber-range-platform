export const achievements = [
    {
      id: 'novice',
      name: '🔰 Новичок',
      description: 'Заверши первое задание',
      detailedDescription: 'Выполни любое задание на платформе',
      icon: '🔰',
      condition: (stats) => stats.completedTasks >= 1,
      target: 1,
      getProgress: (stats) => Math.min(stats.completedTasks, 1)
    },
    {
      id: 'researcher',
      name: '🧪 Исследователь',
      description: 'Заверши 3 задания',
      detailedDescription: 'Прокачай свои навыки, выполнив 3 задания',
      icon: '🧪',
      condition: (stats) => stats.completedTasks >= 3,
      target: 3,
      getProgress: (stats) => Math.min(stats.completedTasks, 3)
    },
    {
      id: 'hunter',
      name: '🎯 Охотник',
      description: 'Заверши 5 заданий',
      detailedDescription: 'Стань настоящим охотником за уязвимостями',
      icon: '🎯',
      condition: (stats) => stats.completedTasks >= 5,
      target: 5,
      getProgress: (stats) => Math.min(stats.completedTasks, 5)
    },
    {
      id: 'sql_hunter',
      name: '🐍 SQL Hunter',
      description: 'Запусти SQL Injection',
      detailedDescription: 'Обнаружь и эксплуатируй SQL-уязвимость',
      icon: '🐍',
      condition: (stats) => stats.challengesCompleted?.includes('sqli') || false,
      target: 1,
      getProgress: (stats) => stats.challengesCompleted?.includes('sqli') ? 1 : 0
    },
    {
      id: 'xss_warrior',
      name: '⚡ XSS Warrior',
      description: 'Запусти XSS',
      detailedDescription: 'Продемонстрируй межсайтовый скриптинг',
      icon: '⚡',
      condition: (stats) => stats.challengesCompleted?.includes('xss') || false,
      target: 1,
      getProgress: (stats) => stats.challengesCompleted?.includes('xss') ? 1 : 0
    },
    {
      id: 'path_traversal',
      name: '📁 Path Traversal',
      description: 'Запусти Path Traversal',
      detailedDescription: 'Обойди ограничения файловой системы',
      icon: '📁',
      condition: (stats) => stats.challengesCompleted?.includes('path_traversal') || false,
      target: 1,
      getProgress: (stats) => stats.challengesCompleted?.includes('path_traversal') ? 1 : 0
    },
    {
      id: 'expert',
      name: '🎖️ Эксперт',
      description: 'Достигни 10 уровня',
      detailedDescription: 'Прокачай персонажа до 10 уровня',
      icon: '🎖️',
      condition: (stats) => stats.level >= 10,
      target: 10,
      getProgress: (stats) => Math.min(stats.level, 10)
    }
  ];