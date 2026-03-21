import React, { useState, useEffect } from 'react';
import { achievements } from '../data/achievements';

const AchievementsList = ({ userBadges = [], userStats = {} }) => {
  const [newBadge, setNewBadge] = useState(null);

  // Проверяем, не появилось ли новое достижение (для анимации)
  useEffect(() => {
    const lastBadge = localStorage.getItem('lastUnlockedBadge');
    if (lastBadge && !userBadges.includes(lastBadge)) {
      setNewBadge(lastBadge);
      setTimeout(() => setNewBadge(null), 3000);
      localStorage.removeItem('lastUnlockedBadge');
    }
  }, [userBadges]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map(achievement => {
        const isUnlocked = userBadges.includes(achievement.id);
        const progress = achievement.getProgress?.(userStats) || 0;
        const progressPercent = (progress / achievement.target) * 100;
        const isNew = newBadge === achievement.id;

        return (
          <div
            key={achievement.id}
            className={`
              bg-[#1a2332] border rounded-xl p-5 transition-all duration-500
              hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]
              ${isUnlocked 
                ? 'border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                : 'border-[#2a3a5e] opacity-70'
              }
              ${isNew ? 'animate-pulse border-[#ff3b9c] shadow-[0_0_20px_#ff3b9c]' : ''}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className={`text-lg font-bold ${isUnlocked ? 'text-[#00f0ff]' : 'text-gray-400'}`}>
                  {achievement.name}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {achievement.description}
                </div>
                <div className="text-xs text-gray-500 mt-2 italic">
                  {achievement.detailedDescription}
                </div>
                
                {/* Прогресс-бар для неполученных достижений */}
                {!isUnlocked && achievement.target > 1 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Прогресс</span>
                      <span>{progress} / {achievement.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2a3a5e] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff3b9c] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Для полученных достижений — зелёная галочка */}
                {isUnlocked && (
                  <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    <span>✅</span> Получено!
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementsList;