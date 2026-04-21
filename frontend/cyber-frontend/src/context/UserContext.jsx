import React, { createContext, useState, useContext, useEffect } from 'react';
import { achievements } from '../data/achievements';

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
    challengesCompleted: [],
    attacksDetected: 0,
    badges: []
  });

  // Загружаем данные из localStorage при старте
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          name: parsed.username || parsed.full_name || parsed.name || 'Пользователь',
          email: parsed.email || '',
          level: parsed.level || 1,
          xp: parsed.experience_points || parsed.xp || 0,
          nextLevelXp: parsed.nextLevelXp || 100,
          completedTasks: parsed.completedTasks || 0,
          rank: parsed.rank || 'Новичок',
          challengesCompleted: parsed.challengesCompleted || [],
          attacksDetected: parsed.attacksDetected || 0,
          badges: parsed.badges || []
        });
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
      }
    }
  }, []);

  // Сохраняем данные при изменении
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Функция для проверки и обновления достижений
  const checkAchievements = (currentUser) => {
    const stats = {
      completedTasks: currentUser.completedTasks,
      level: currentUser.level,
      challengesCompleted: currentUser.challengesCompleted,
      attacksDetected: currentUser.attacksDetected
    };

    const newBadges = [...currentUser.badges];
    let updated = false;
    let newAchievement = null;

    achievements.forEach(achievement => {
      if (!newBadges.includes(achievement.id) && achievement.condition(stats)) {
        newBadges.push(achievement.id);
        updated = true;
        newAchievement = achievement;
        localStorage.setItem('lastUnlockedBadge', achievement.id);
      }
    });

    if (updated && newAchievement) {
      // Уведомление о достижении пока оставим заглушкой
      console.log(`🏆 Получено достижение: ${newAchievement.name}`);
    }

    if (updated) {
      return { ...currentUser, badges: newBadges };
    }
    return currentUser;
  };

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

      const updated = {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        rank: newRank,
        completedTasks: prev.completedTasks + 1
      };

      return checkAchievements(updated);
    });
  };

  const addCompletedChallenge = (challengeType) => {
    setUser(prev => {
      if (prev.challengesCompleted.includes(challengeType)) return prev;
      const updated = {
        ...prev,
        challengesCompleted: [...prev.challengesCompleted, challengeType]
      };
      return checkAchievements(updated);
    });
  };

  const addDetectedAttack = () => {
    setUser(prev => {
      const updated = {
        ...prev,
        attacksDetected: prev.attacksDetected + 1
      };
      return checkAchievements(updated);
    });
  };

  const updateUser = (userData) => {
    setUser({
      name: userData.username || userData.full_name || userData.name || 'Пользователь',
      email: userData.email || '',
      level: 1,
      xp: userData.experience_points || 0,
      nextLevelXp: 100,
      completedTasks: 0,
      rank: 'Новичок',
      challengesCompleted: [],
      attacksDetected: 0,
      badges: []
    });
  };

  const resetUser = () => {
    setUser({
      name: 'Гость',
      email: '',
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      completedTasks: 0,
      rank: 'Новичок',
      challengesCompleted: [],
      attacksDetected: 0,
      badges: []
    });
    localStorage.removeItem('user');
    localStorage.removeItem('lastUnlockedBadge');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      addXP, 
      updateUser,
      addCompletedChallenge,
      addDetectedAttack,
      resetUser
    }}>
      {children}
    </UserContext.Provider>
  );
};