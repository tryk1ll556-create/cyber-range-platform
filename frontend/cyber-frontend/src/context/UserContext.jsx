import React, { createContext, useState, useContext, useEffect } from 'react';
import { achievements } from '../data/achievements';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          name: parsed.username || parsed.full_name || parsed.name || 'Пользователь',
          email: parsed.email || '',
          level: parsed.level || 1,
          xp: parsed.xp || 0,
          nextLevelXp: parsed.nextLevelXp || 100,
          completedTasks: parsed.completedTasks || 0,
          rank: parsed.rank || 'Новичок',
          challengesCompleted: parsed.challengesCompleted || [],
          attacksDetected: parsed.attacksDetected || 0,
          badges: parsed.badges || []
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const checkAchievements = (currentUser) => {
    if (!currentUser) return currentUser;
    const stats = {
      completedTasks: currentUser.completedTasks,
      level: currentUser.level,
      challengesCompleted: currentUser.challengesCompleted,
      attacksDetected: currentUser.attacksDetected
    };
    const newBadges = [...currentUser.badges];
    let updated = false;
    achievements.forEach(achievement => {
      if (!newBadges.includes(achievement.id) && achievement.condition(stats)) {
        newBadges.push(achievement.id);
        updated = true;
        localStorage.setItem('lastUnlockedBadge', achievement.id);
      }
    });
    if (updated) {
      return { ...currentUser, badges: newBadges };
    }
    return currentUser;
  };

  const addXP = (amount) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;
      while (newXp >= newNextXp) {
        newLevel++;
        newXp -= newNextXp;
        newNextXp = Math.floor(newNextXp * 1.5);
      }
      // Новые условия ранга: каждые 3 уровня
      let newRank = 'Новичок';
      if (newLevel >= 3) newRank = 'Белый хакер';
      if (newLevel >= 6) newRank = 'Хакер';
      if (newLevel >= 9) newRank = 'Эксперт';
      if (newLevel >= 12) newRank = 'Мастер';
      
      const updated = checkAchievements({
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        rank: newRank,
        completedTasks: prev.completedTasks + 1
      });
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const addCompletedChallenge = (challengeType) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      if (prev.challengesCompleted.includes(challengeType)) return prev;
      const updated = checkAchievements({
        ...prev,
        challengesCompleted: [...prev.challengesCompleted, challengeType]
      });
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const addDetectedAttack = () => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        attacksDetected: prev.attacksDetected + 1
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const newUser = {
        name: userData.username || userData.full_name || userData.name || prev?.name || 'Пользователь',
        email: userData.email || prev?.email || '',
        level: userData.level ?? prev?.level ?? 1,
        xp: userData.experience_points ?? userData.xp ?? prev?.xp ?? 0,
        nextLevelXp: userData.nextLevelXp ?? prev?.nextLevelXp ?? 100,
        completedTasks: userData.completedTasks ?? prev?.completedTasks ?? 0,
        rank: userData.rank ?? prev?.rank ?? 'Новичок',
        challengesCompleted: userData.challengesCompleted ?? prev?.challengesCompleted ?? [],
        attacksDetected: userData.attacksDetected ?? prev?.attacksDetected ?? 0,
        badges: userData.badges ?? prev?.badges ?? []
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const resetUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('lastUnlockedBadge');
    localStorage.removeItem('avatar');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

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