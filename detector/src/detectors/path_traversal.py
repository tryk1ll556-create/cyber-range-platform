import re
from typing import Dict, Any, List

class PathTraversalDetector:
    """Детектор Path Traversal атак"""
    
    def __init__(self):
        self.patterns = [
            r"\.\./",
            r"\.\.\\",
            r"\.\.%2f",
            r"\.\.%5c",
            r"etc/passwd",
            r"windows/win\.ini",
            r"\.\.%00"
        ]
    
    def detect(self, text: str) -> List[Dict[str, Any]]:
        """Обнаруживает Path Traversal в тексте"""
        detections = []
        
        for pattern in self.patterns:
            if re.search(pattern, text, re.IGNORECASE):
                detection = {
                    'type': 'PATH_TRAVERSAL',
                    'pattern': pattern,
                    'input_sample': text[:100],
                    'risk_level': 'HIGH',
                    'confidence': 'MEDIUM'
                }
                detections.append(detection)
        
        return detections

# Пример использования
if __name__ == "__main__":
    detector = PathTraversalDetector()
    test_cases = [
        "../../etc/passwd",
        "..\\windows\\win.ini",
        "normal_file.txt"
    ]
    
    for test in test_cases:
        print(f"Анализируем: {test}")
        results = detector.detect(test)
        for result in results:
            print(f"  🚨 Обнаружено: {result['type']}")