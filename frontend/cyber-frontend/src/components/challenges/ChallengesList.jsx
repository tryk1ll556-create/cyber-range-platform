import React from 'react';
import { challenges } from '../../data/challenges';

const ChallengesList = ({ onStartSandbox, isLoading }) => {
  return (
    <section className="challenges-section">
      <h2>🎯 Доступные задания</h2>
      <div className="challenges-grid">
        {challenges.map(challenge => (
          <div key={challenge.id} className="challenge-card">
            <div className="challenge-header">
              <span className="challenge-icon">{challenge.icon}</span>
              <h3>{challenge.name}</h3>
              <span className="difficulty-badge">{challenge.difficulty}</span>
            </div>
            <p>{challenge.description}</p>
            <div className="challenge-points">🏆 {challenge.points} очков</div>
            <button 
              onClick={() => onStartSandbox(challenge.id)}
              disabled={isLoading}
              className="challenge-btn"
            >
              {isLoading ? 'Запуск...' : 'Начать задание'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChallengesList;