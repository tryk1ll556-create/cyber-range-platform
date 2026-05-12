import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navigation = ({ activeTab, onTabChange, sandboxCount }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  if (location.pathname !== '/') return null;

  const tabs = [
    { id: 'challenges', label: 'Задания' },
    { id: 'sandboxes', label: `Песочницы (${sandboxCount})` }
  ];

  return (
    <div className="flex justify-center gap-4 my-8 px-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-8 py-3 rounded-xl text-base font-medium tracking-wide transition-all duration-300
            ${activeTab === tab.id
              ? isDark
                ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_#00f0ff] font-semibold'
                : 'bg-[#0891b2] text-white shadow-[0_0_8px_rgba(8,145,178,0.5)] font-semibold'
              : isDark
                ? 'bg-[#1a2332] text-gray-300 border border-[#2a3a5e] hover:border-[#00f0ff] hover:text-[#00f0ff]'
                : 'bg-gray-200 text-gray-700 border border-gray-300 hover:border-[#0891b2] hover:text-[#0891b2]'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;