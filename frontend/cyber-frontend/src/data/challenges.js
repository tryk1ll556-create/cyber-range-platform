export const challenges = [
  {
    id: 'sqli',
    name: 'SQL Injection',
    icon: '🗃️',
    description: 'Найди и эксплуатируй SQL-уязвимости',
    difficulty: '🟢 Начальный',
    points: 100,
    completedCount: 156,
    type: 'sqli'
  },
  {
    id: 'xss',
    name: 'XSS Attack',
    icon: '⚡',
    description: 'Продемонстрируй межсайтовый скриптинг',
    difficulty: '🟡 Средний',
    points: 150,
    completedCount: 143,
    type: 'xss'
  },
  {
    id: 'null_byte',
    name: 'Poison Null Byte',
    icon: '💉',
    description: 'Обойди проверки расширения файлов с помощью нуль-байта',
    difficulty: '🔴 Продвинутый',
    points: 175,
    completedCount: 67,
    type: 'null_byte'
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal',
    icon: '📁',
    description: 'Обойди ограничения файловой системы',
    difficulty: '🟡 Средний',
    points: 175,
    completedCount: 98,
    type: 'path_traversal'
  }
];