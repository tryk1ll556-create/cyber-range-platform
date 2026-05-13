export const challenges = [
  {
    id: 'sqli',
    name: 'SQL Injection',
    icon: '🗃️',
    description: 'Найди и эксплуатируй SQL-уязвимости',
    difficulty: '🟢 Начальный',
    points: 100,
    completedCount: 156   // ← добавить
  },
  {
    id: 'xss',
    name: 'XSS Attack',
    icon: '⚡',
    description: 'Продемонстрируй межсайтовый скриптинг',
    difficulty: '🟡 Средний',
    points: 150,
    completedCount: 143   // ← добавить
  },
  {
    id: 'rce',
    name: 'RCE',
    icon: '💻',
    description: 'Используй уязвимости выполнения кода',
    difficulty: '🔴 Продвинутый',
    points: 200,
    completedCount: 89    // ← добавить
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal',
    icon: '📁',
    description: 'Обойди ограничения файловой системы',
    difficulty: '🟡 Средний',
    points: 175,
    completedCount: 98    // ← добавить
  }
];