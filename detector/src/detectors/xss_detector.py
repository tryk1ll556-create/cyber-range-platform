import re
from typing import Dict, Any, List

class XSSDetector:
    """Детектор XSS атак"""
    
    def __init__(self):
        self.patterns = {
            'script_tags': [
                r"<script.*?>.*?</script>",
                r"<script.*?>",
                r"</script>"
            ],
            'event_handlers': [
                r"onload\s*=",
                r"onerror\s*=", 
                r"onclick\s*=",
                r"onmouseover\s*=",
                r"onfocus\s*="
            ],
            'javascript_protocol': [
                r"javascript:",
                r"jscript:",
                r"vbscript:",
                r"data:"
            ],
            'svg_injection': [
                r"<svg.*?>",
                r"<img.*?onerror=.*?>",
                r"<body.*?onload=.*?>"
            ]
        }
        
        self.risk_levels = {
            'script_tags': 'HIGH',
            'event_handlers': 'MEDIUM',
            'javascript_protocol': 'MEDIUM',
            'svg_injection': 'HIGH'
        }
    
    def detect(self, text: str) -> List[Dict[str, Any]]:
        """Обнаруживает XSS в тексте"""
        detections = []
        
        for attack_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    detection = {
                        'type': 'XSS',
                        'subtype': attack_type.upper(),
                        'pattern': pattern,
                        'input_sample': text[:100],
                        'risk_level': self.risk_levels[attack_type],
                        'confidence': 'HIGH'
                    }
                    detections.append(detection)
                    break
        
        return detections

# Пример использования
if __name__ == "__main__":
    detector = XSSDetector()
    
    test_cases = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert('XSS')",
        "normal text"
    ]
    
    for test in test_cases:
        print(f"Анализируем: {test}")
        results = detector.detect(test)
        for result in results:
            print(f"  🚨 Обнаружено: {result['subtype']} | Риск: {result['risk_level']}")
        
        if not results:
            print("  ✅ Угроз не обнаружено")
        print()