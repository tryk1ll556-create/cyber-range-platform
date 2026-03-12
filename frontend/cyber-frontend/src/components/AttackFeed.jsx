import React, { useEffect, useState } from 'react';
import { detectorApi } from '../services/detectorApi';

const AttackFeed = ({ limit = 10 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectorApi.getTimeline()
      .then(data => {
        setEvents(data.slice(-limit).reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки ленты атак:', err);
        setLoading(false);
      });
  }, [limit]);

  if (loading) return <div className="text-gray-400">Загрузка...</div>;

  return (
    <div className="bg-[#141b2b] border border-[#2a3a5e] rounded-xl p-4">
      <h3 className="text-lg font-bold text-[#00f0ff] mb-3">⚡ Последние атаки</h3>
      {events.length === 0 ? (
        <p className="text-gray-400">Нет данных</p>
      ) : (
        <div className="space-y-2">
          {events.map((event, idx) => (
            <div key={idx} className="border-b border-[#2a3a5e] pb-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{event.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  event.risk === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  {event.risk}
                </span>
              </div>
              <div className="text-white">{event.attacker_id}</div>
              <div className="text-xs text-gray-400">{event.ip_address}</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {event.detections.map((d, i) => (
                  <span key={i} className="text-xs bg-[#1a2332] px-2 py-0.5 rounded">
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