import React from 'react';

const Navigation = ({ activeTab, onTabChange, sandboxCount }) => {
  const tabs = [
    { id: 'challenges', label: '🎯 Задания' },
    { id: 'sandboxes', label: `🖥️ Песочницы (${sandboxCount})` }
  ];

  return (
    <nav className="app-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;