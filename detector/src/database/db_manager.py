import sqlite3
import json
from datetime import datetime
from typing import Dict, Any, List

class DatabaseManager:
    """Менеджер базы данных для сохранения результатов"""
    
    def __init__(self, db_path: str = "detector.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Инициализирует структуру базу данных"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Таблица для запросов (ОБНОВЛЕНО - добавлен sandbox_id)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                params TEXT NOT NULL,
                sandbox_id TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Таблица для обнаруженных атак
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER,
                detection_type TEXT NOT NULL,
                detection_subtype TEXT,
                risk_level TEXT NOT NULL,
                location TEXT NOT NULL,
                pattern TEXT,
                input_sample TEXT,
                confidence TEXT,
                FOREIGN KEY (request_id) REFERENCES requests (id)
            )
        ''')
        
        # Таблица для статистики
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE DEFAULT CURRENT_DATE,
                total_requests INTEGER DEFAULT 0,
                detected_attacks INTEGER DEFAULT 0,
                sql_injections INTEGER DEFAULT 0,
                xss_attacks INTEGER DEFAULT 0,
                path_traversals INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_request(self, method: str, url: str, params: Dict[str, Any], sandbox_id: str = None) -> int:
        """Сохраняет запрос в базу данных и возвращает ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO requests (method, url, params, sandbox_id)
            VALUES (?, ?, ?, ?)
        ''', (method, url, json.dumps(params), sandbox_id))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return request_id
    
    def save_detections(self, request_id: int, detections: List[Dict[str, Any]]):
        """Сохраняет обнаруженные атаки"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for detection in detections:
            cursor.execute('''
                INSERT INTO detections 
                (request_id, detection_type, detection_subtype, risk_level, location, pattern, input_sample, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                request_id,
                detection['type'],
                detection.get('subtype', 'DIRECT'),
                detection['risk_level'],
                detection['location'],
                detection.get('pattern', ''),
                detection.get('input_sample', ''),
                detection.get('confidence', 'MEDIUM')
            ))
        
        conn.commit()
        conn.close()
    
    def update_statistics(self, stats: Dict[str, int]):
        """Обновляет дневную статистику"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        # Проверяем есть ли запись на сегодня
        cursor.execute('SELECT id FROM statistics WHERE date = ?', (today,))
        existing = cursor.fetchone()
        
        if existing:
            # Обновляем существующую запись
            cursor.execute('''
                UPDATE statistics 
                SET total_requests = total_requests + ?,
                    detected_attacks = detected_attacks + ?,
                    sql_injections = sql_injections + ?,
                    xss_attacks = xss_attacks + ?,
                    path_traversals = path_traversals + ?
                WHERE date = ?
            ''', (
                stats['total_requests'],
                stats['detected_attacks'],
                stats['sql_injections'],
                stats['xss_attacks'],
                stats['path_traversals'],
                today
            ))
        else:
            # Создаем новую запись
            cursor.execute('''
                INSERT INTO statistics 
                (date, total_requests, detected_attacks, sql_injections, xss_attacks, path_traversals)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                today,
                stats['total_requests'],
                stats['detected_attacks'],
                stats['sql_injections'],
                stats['xss_attacks'],
                stats['path_traversals']
            ))
        
        conn.commit()
        conn.close()
    
    def get_daily_stats(self) -> Dict[str, Any]:
        """Возвращает статистику за сегодня"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        cursor.execute('''
            SELECT total_requests, detected_attacks, sql_injections, xss_attacks, path_traversals
            FROM statistics 
            WHERE date = ?
        ''', (today,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'total_requests': row[0],
                'detected_attacks': row[1],
                'sql_injections': row[2],
                'xss_attacks': row[3],
                'path_traversals': row[4]
            }
        else:
            return {
                'total_requests': 0,
                'detected_attacks': 0,
                'sql_injections': 0,
                'xss_attacks': 0,
                'path_traversals': 0
            }
    
    def get_recent_detections(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Возвращает последние обнаруженные атаки"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.method, r.url, r.timestamp, r.sandbox_id,
                   d.detection_type, d.detection_subtype, d.risk_level, d.location
            FROM detections d
            JOIN requests r ON d.request_id = r.id
            ORDER BY r.timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'method': row[0],
                'url': row[1],
                'timestamp': row[2],
                'sandbox_id': row[3],
                'type': row[4],
                'subtype': row[5],
                'risk_level': row[6],
                'location': row[7]
            })
        
        conn.close()
        return results

# Тест
if __name__ == "__main__":
    db = DatabaseManager()
    print("✅ База данных обновлена с поддержкой sandbox_id!")