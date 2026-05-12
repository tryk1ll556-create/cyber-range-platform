import React, { useEffect, useState } from 'react';
import { detectorApi } from '../services/detectorApi';
import { useTheme } from '../context/ThemeContext';

// Mock-данные для демонстрации, если детектор не отвечает
const mockEvents = [
  { timestamp: '14:23:05', attacker_id: '192.168.1.105', ip_address: '192.168.1.105', risk: 'HIGH', detections: ['SQL Injection'] },
  { timestamp: '14:22:30', attacker_id: '10.0.0.45', ip_address: '10.0.0.45', risk: 'MEDIUM', detections: ['XSS'] },
  { timestamp: '14:21:15', attacker_id: '192.168.1.200', ip_address: '192.168.1.200', risk: 'LOW', detections: ['Path Traversal'] },
  { timestamp: '14:20:45', attacker_id: '192.168.1.50', ip_address: '192.168.1.50', risk: 'HIGH', detections: ['SQL Injection', 'XSS'] },
  { timestamp: '14:19:30', attacker_id: '172.16.0.10', ip_address: '172.16.0.10', risk: 'MEDIUM', detections: ['Command Injection'] },
];

const AttackFeed = ({ limit = 10 }) => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const loadEvents = async () => {
    try {
      const data = await detectorApi.getTimeline();
      if (data && data.length > 0) {
        setEvents(data.slice(-limit).reverse());
        setUsingMock(false);
      } else {
        setEvents(mockEvents);
        setUsingMock(true);
      }
    } catch (err) {
      console.warn('Детектор не отвечает, показываем тестовые данные');
      setEvents(mockEvents);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, [limit]);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'HIGH': return isDark ? 'bg-red-600' : 'bg-red-500';
      case 'MEDIUM': return isDark ? 'bg-yellow-600' : 'bg-yellow-500';
      case 'LOW': return isDark ? 'bg-green-600' : 'bg-green-500';
      default: return isDark ? 'bg-gray-600' : 'bg-gray-400';
    }
  };

  if (loading) return (
    <div className={`rounded-xl p-4 ${isDark ? 'bg-[#141b2b] text-gray-400' : 'bg-white text-gray-500'}`}>
      Загрузка...
    </div>
  );

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${
      isDark 
        ? 'bg-[#141b2b] border border-[#2a3a5e]' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-bold ${isDark ? 'text-[#00f0ff]' : 'text-[#0891b2]'}`}>
          ⚡ Последние атаки
        </h3>
        {usingMock && (
          <span className={`text-xs px-2 py-1 rounded ${
            isDark ? 'bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
          }`}>
            ⚠️ Демо-режим
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Нет данных об атаках
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event, idx) => (
            <div key={idx} className={`border-b pb-2 text-sm ${
              isDark ? 'border-[#2a3a5e]' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {event.timestamp}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs text-white ${getRiskColor(event.risk)}`}>
                  {event.risk}
                </span>
              </div>
              <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {event.attacker_id}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {event.ip_address}
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {event.detections?.map((d, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded ${
                    isDark 
                      ? 'bg-[#1a2332] text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttackFeed;