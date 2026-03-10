import re
from typing import Dict, Any, List
from .base_detector import BaseDetector


class XSSDetector(BaseDetector):
    """
    Детектор XSS атак.
    Реализует унифицированный интерфейс BaseDetector.
    """

    def __init__(self):
        self.patterns = {
            "script_tags": [r"<script.*?>.*?</script>", r"<script.*?>", r"</script>"],
            "event_handlers": [
                r"onload\s*=",
                r"onerror\s*=",
                r"onclick\s*=",
                r"onmouseover\s*=",
                r"onfocus\s*=",
            ],
            "javascript_protocol": [
                r"javascript:",
                r"jscript:",
                r"vbscript:",
                r"data:",
            ],
            "svg_injection": [
                r"<svg.*?>",
                r"<img.*?onerror=.*?>",
                r"<body.*?onload=.*?>",
            ],
        }

        self.risk_levels = {
            "script_tags": "HIGH",
            "event_handlers": "MEDIUM",
            "javascript_protocol": "MEDIUM",
            "svg_injection": "HIGH",
        }

    def get_detector_name(self) -> str:
        return "XSSDetector"

    def detect(self, input_data: str) -> List[Dict[str, Any]]:
        """
        Унифицированный метод обнаружения XSS.
        """
        detections = []

        if not isinstance(input_data, str):
            return detections

        for attack_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, input_data, re.IGNORECASE):
                    detection = {
                        "type": "XSS",
                        "subtype": attack_type.upper(),
                        "pattern": pattern,
                        "input_sample": input_data[:200],
                        "risk_level": self.risk_levels.get(attack_type, "LOW"),
                        "confidence": "HIGH",
                        "detector": self.get_detector_name(),
                    }
                    detections.append(detection)
                    break

        return detections
