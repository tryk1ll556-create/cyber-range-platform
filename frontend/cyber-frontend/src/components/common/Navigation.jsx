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
    <nav className="bg-[#0f1625] border-b border-[#2a3a5e] px-4 md:px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 md:px-6 py-2 rounded-lg font-mono transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_#00f0ff] font-bold'
                  : 'text-white hover:bg-[#2a3a5e] border border-transparent hover:border-[#00f0ff]'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          to="/profile"
          className="w-full md:w-auto text-center bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] px-6 py-2 rounded-lg font-mono font-semibold hover:bg-[#00f0ff] hover:text-black transition-all"
        >
          👤 Профиль
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;