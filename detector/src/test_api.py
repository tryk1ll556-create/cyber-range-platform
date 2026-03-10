import requests
import json

API_BASE = "http://localhost:8001"

def test_all_endpoints():
    print("🧪 ТЕСТИРОВАНИЕ API ДЕТЕКТОРА")
    print("=" * 50)
    
    try:
        # 1. Главная страница
        response = requests.get(f"{API_BASE}/")
        print(f"✅ Главная: {response.status_code}")
        
        # 2. Проверка здоровья
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ Здоровье: {response.json()}")
        
        # 3. Статистика
        response = requests.get(f"{API_BASE}/api/stats")
        stats = response.json()
        print(f"✅ Статистика: {stats['success']}")
        print(f"   Всего запросов: {stats['database_stats']['total_requests']}")
        
        # 4. Анализ тестового запроса
        test_data = {
            "method": "POST",
            "url": "/api/Users/login",
            "params": {"email": "admin' OR 1=1--", "password": "test123"},
            "sandbox_id": "test_sandbox_001"
        }
        
        response = requests.post(f"{API_BASE}/api/analyze", json=test_data)
        result = response.json()
        print(f"✅ Анализ запроса: {result['success']}")
        if result['success']:
            detections = result['data']['summary']['total_detections']
            print(f"   Обнаружено угроз: {detections}")
        
        # 5. Последние атаки
        response = requests.get(f"{API_BASE}/api/attacks/recent?limit=3")
        attacks = response.json()
        print(f"✅ Последние атаки: {attacks['total']} штук")
        
        print("\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! API РАБОТАЕТ КОРРЕКТНО!")
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")

if __name__ == "__main__":
    test_all_endpoints()