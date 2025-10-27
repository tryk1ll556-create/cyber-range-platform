#!/usr/bin/env python3
"""
ПРОСМОТР БАЗЫ ДАННЫХ
"""

import sqlite3
from database.db_manager import DatabaseManager

def check_database():
    print("🔍 ПРОВЕРКА БАЗЫ ДАННЫХ")
    print("=" * 50)
    
    # Подключаемся к базе
    conn = sqlite3.connect('detector.db')
    cursor = conn.cursor()
    
    # Показываем все таблицы
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("📋 ТАБЛИЦЫ В БАЗЕ ДАННЫХ:")
    for table in tables:
        print(f"   - {table[0]}")
    
    print("\n📊 СТАТИСТИКА:")
    
    # Количество запросов
    cursor.execute("SELECT COUNT(*) FROM requests;")
    total_requests = cursor.fetchone()[0]
    print(f"   Всего запросов: {total_requests}")
    
    # Количество обнаружений
    cursor.execute("SELECT COUNT(*) FROM detections;")
    total_detections = cursor.fetchone()[0]
    print(f"   Всего обнаружений атак: {total_detections}")
    
    # Статистика по типам атак
    cursor.execute("SELECT detection_type, COUNT(*) FROM detections GROUP BY detection_type;")
    attack_types = cursor.fetchall()
    
    print(f"   Распределение атак:")
    for attack_type, count in attack_types:
        print(f"     - {attack_type}: {count}")
    
    # Последние 3 запроса
    print(f"\n🕒 ПОСЛЕДНИЕ ЗАПРОСЫ:")
    cursor.execute("SELECT id, method, url, sandbox_id FROM requests ORDER BY id DESC LIMIT 3;")
    recent_requests = cursor.fetchall()
    
    for req_id, method, url, sandbox_id in recent_requests:
        print(f"   - ID {req_id}: {method} {url} (Sandbox: {sandbox_id})")
    
    conn.close()
    
    # Проверяем через DatabaseManager
    print(f"\n📈 СТАТИСТИКА ИЗ DATABASE MANAGER:")
    db = DatabaseManager()
    stats = db.get_daily_stats()
    print(f"   За сегодня: {stats}")

if __name__ == "__main__":
    check_database()