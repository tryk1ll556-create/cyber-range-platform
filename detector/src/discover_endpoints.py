import urllib.request
import json

def discover_endpoints():
    """Обнаруживаем доступные endpoints API"""
    
    base_url = "http://localhost:8001"
    
    # Проверяем документацию
    print("📖 Проверяем документацию...")
    try:
        with urllib.request.urlopen(f"{base_url}/docs") as response:
            print("✅ Документация доступна: http://localhost:8001/docs")
    except Exception as e:
        print(f"❌ Документация недоступна: {e}")
    
    # Проверяем JSON документацию
    print("\n🔍 Ищем доступные endpoints...")
    
    endpoints_to_check = [
        "/health",
        "/api/events",
        "/api/stats", 
        "/events",
        "/api/attack-events",
        "/api/detections",
        "/api/alerts",
        "/detections",
        "/alerts"
    ]
    
    for endpoint in endpoints_to_check:
        try:
            with urllib.request.urlopen(f"{base_url}{endpoint}") as response:
                data = response.read().decode('utf-8')
                result = json.loads(data)
                print(f"✅ {endpoint}: РАБОТАЕТ - {result}")
        except Exception as e:
            print(f"❌ {endpoint}: не доступен")
    
    print("\n🎯 Открой в браузере: http://localhost:8001/docs")
    print("   чтобы увидеть все доступные endpoints!")

if __name__ == "__main__":
    discover_endpoints()