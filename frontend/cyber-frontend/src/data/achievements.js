export const achievements = [
  {
    id: 'novice',
    name: 'Новичок',
    description: 'Запустить первое задание',
    icon: '🌱',
    condition: (stats) => stats.completedTasks >= 1
  },
  {
    id: 'sql_hunter',
    name: 'Охотник на SQL',
    description: 'Обнаружить SQL-инъекцию',
    icon: '🗃️',
    condition: (stats) => stats.challengesCompleted?.includes('sqli') || false
  },
  {
    id: 'xss_warrior',
    name: 'XSS Воин',
    description: 'Обнаружить XSS атаку',
    icon: '⚡',
    condition: (stats) => stats.challengesCompleted?.includes('xss') || false
  },
  {
    id: 'path_traversal',
    name: 'Обходчик путей',
    description: 'Обнаружить Path Traversal',
    icon: '📁',
    condition: (stats) => stats.challengesCompleted?.includes('path_traversal') || false
  },
  {
    id: 'null_byte',
    name: 'Нуль-байт мастер',
    description: 'Обнаружить Poison Null Byte атаку',
    icon: '💉',
    condition: (stats) => stats.challengesCompleted?.includes('null_byte') || false
  },
  {
    id: 'researcher',
    name: 'Исследователь',
    description: 'Выполнить 3 задания',
    icon: '🔬',
    condition: (stats) => stats.completedTasks >= 3
  },
  {
    id: 'hunter',
    name: 'Охотник',
    description: 'Выполнить 5 заданий',
    icon: '🏹',
    condition: (stats) => stats.completedTasks >= 5
  },
  {
    id: 'expert',
    name: 'Эксперт',
    description: 'Выполнить 10 заданий',
    icon: '🎓',
    condition: (stats) => stats.completedTasks >= 10
  },
  {
    id: 'level_5',
    name: '5 уровень',
    description: 'Достичь 5 уровня',
    icon: '⭐',
    condition: (stats) => stats.level >= 5
  },
  {
    id: 'level_10',
    name: '10 уровень',
    description: 'Достичь 10 уровня',
    icon: '🌟🌟',
    condition: (stats) => stats.level >= 10
  },
  {
    id: 'level_15',
    name: '15 уровень',
    description: 'Достичь 15 уровня',
    icon: '🌟🌟🌟',
    condition: (stats) => stats.level >= 15
  },
  {
    id: 'level_20',
    name: 'Мастер',
    description: 'Достичь 20 уровня',
    icon: '🏆',
    condition: (stats) => stats.level >= 20
  }
];