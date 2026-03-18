import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Гость',
    email: '',
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    completedTasks: 0,
    rank: 'Новичок',
    badges: []
  });

  // Загружаем данные из localStorage при старте
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          name: parsed.username || parsed.full_name || 'Пользователь',
          email: parsed.email || '',
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          completedTasks: 0,
          rank: 'Новичок',
          badges: []
        });
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
      }
    }
  }, []);

  const addXP = (amount) => {
    setUser(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      while (newXp >= newNextXp) {
        newLevel++;
        newXp -= newNextXp;
        newNextXp = Math.floor(newNextXp * 1.5);
      }

      let newRank = 'Новичок';
      if (newLevel >= 5) newRank = 'Белый хакер';
      if (newLevel >= 10) newRank = 'Хакер';
      if (newLevel >= 15) newRank = 'Эксперт';
      if (newLevel >= 20) newRank = 'Мастер';

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        rank: newRank,
        completedTasks: prev.completedTasks + 1
      };
    });
  };

  // Функция для обновления пользователя после регистрации/входа
  const updateUser = (userData) => {
    setUser({
      name: userData.username || userData.full_name || 'Пользователь',
      email: userData.email || '',
      level: 1,
      xp: userData.experience_points || 0,
      nextLevelXp: 100,
      completedTasks: 0,
      rank: 'Новичок',
      badges: []
    });
  };

  return (
    <UserContext.Provider value={{ user, addXP, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};