import re
from typing import Dict, Any, List
from .base_detector import BaseDetector


class PathTraversalDetector(BaseDetector):
    """
    Детектор Path Traversal атак.
    Реализует унифицированный интерфейс BaseDetector.
    """

    def __init__(self):
        self.patterns = [
            r"\.\./",
            r"\.\.\\",
            r"\.\.%2f",
            r"\.\.%5c",
            r"etc/passwd",
            r"windows/win\.ini",
            r"\.\.%00",
        ]

    def get_detector_name(self) -> str:
        return "PathTraversalDetector"

    def detect(self, input_data: str) -> List[Dict[str, Any]]:
        """
        Унифицированный метод обнаружения Path Traversal.
        """
        detections = []

        if not isinstance(input_data, str):
            return detections

        for pattern in self.patterns:
            if re.search(pattern, input_data, re.IGNORECASE):
                detection = {
                    "type": "PATH_TRAVERSAL",
                    "subtype": "DIRECTORY_TRAVERSAL",
                    "pattern": pattern,
                    "input_sample": input_data[:200],
                    "risk_level": "HIGH",
                    "confidence": "MEDIUM",
                    "detector": self.get_detector_name(),
                }
                detections.append(detection)
                break  # достаточно одного совпадения

        return detections
