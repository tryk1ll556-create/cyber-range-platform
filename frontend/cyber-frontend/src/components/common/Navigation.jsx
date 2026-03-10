import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ activeTab, onTabChange, sandboxCount }) => {
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  const tabs = [
    { id: 'challenges', label: '🎯 Задания' },
    { id: 'sandboxes', label: `🖥️ Песочницы (${sandboxCount})` }
  ];

  return (
    <nav className="flex justify-center items-center gap-4 bg-[#1a2332] border-b border-[#2d3b4d] px-6 py-3">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-6 py-2 rounded-lg font-mono transition-all ${
            activeTab === tab.id
              ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]'
              : 'text-white hover:bg-[#2a3a5e]'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      <Link
        to="/profile"
        className="px-6 py-2 rounded-lg font-mono border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all ml-auto"
      >
        👤 Профиль
      </Link>
    </nav>
  );
};

export default Navigation;