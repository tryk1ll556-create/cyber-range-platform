import React from 'react';

const SandboxesList = ({ sandboxes, onStopSandbox }) => {
  if (sandboxes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🖥️</div>
        <h3>Нет активных песочниц</h3>
        <p>Запустите задание чтобы начать обучение</p>
      </div>
    );
  }

  return (
    <section className="sandboxes-section">
      <h2>🖥️ Активные песочницы</h2>
      <div className="sandboxes-grid">
        {sandboxes.map(sandbox => (
          <div key={sandbox.sandbox_id} className="sandbox-card">
            <div className="sandbox-header">
              <h3>Песочница #{sandbox.sandbox_id.slice(-4)}</h3>
              <span className="status running">🟢 Запущена</span>
            </div>
            <p><strong>Тип:</strong> {sandbox.challenge_type}</p>
            <div className="sandbox-actions">
              <a 
                href={sandbox.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                🔗 Перейти к заданию
              </a>
              <button 
                onClick={() => onStopSandbox(sandbox.sandbox_id)}
                className="action-btn secondary"
              >
                🛑 Остановить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SandboxesList;