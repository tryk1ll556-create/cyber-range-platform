import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Хакер Студент',
    email: 'student@cyber.local',
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    completedTasks: 0,
    rank: 'Новичок',
    badges: []
  });

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

  return (
    <UserContext.Provider value={{ user, addXP }}>
      {children}
    </UserContext.Provider>
  );
};