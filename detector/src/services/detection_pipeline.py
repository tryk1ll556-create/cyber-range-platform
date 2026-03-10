from typing import Dict, Any, List, Optional

from detectors.base_detector import BaseDetector
from detectors.sql_injection import SQLInjectionDetector
from detectors.xss_detector import XSSDetector
from detectors.path_traversal import PathTraversalDetector
from detectors.behavioral_sqli_verifier import BehavioralSQLiVerifier


class DetectionPipeline:
    """
    Multi-stage Detection Pipeline:

    1) Signature-based detection
    2) Behavioral verification
    3) Risk escalation
    """

    def __init__(self):
        self.detectors: List[BaseDetector] = []
        self.behavioral_verifier = BehavioralSQLiVerifier()
        self._register_detectors()

    def _register_detectors(self):
        """
        Автоматическая регистрация детекторов.
        """
        self.detectors.append(SQLInjectionDetector())
        self.detectors.append(XSSDetector())
        self.detectors.append(PathTraversalDetector())

    def analyze(
        self,
        method: str,
        url: str,
        params: Dict[str, Any],
        log_file_path: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Запускает multi-stage анализ.
        """

        all_detections: List[Dict[str, Any]] = []

        # ==========================
        # Stage 1: Signature Detection
        # ==========================

        # Анализ URL
        for detector in self.detectors:
            url_detections = detector.detect(url)
            for detection in url_detections:
                detection["location"] = "URL"
                all_detections.append(detection)

        # Анализ параметров
        for param_name, param_value in params.items():
            if isinstance(param_value, str):
                for detector in self.detectors:
                    param_detections = detector.detect(param_value)
                    for detection in param_detections:
                        detection["location"] = f"PARAM_{param_name}"
                        all_detections.append(detection)

        # ==========================
        # Stage 2: Behavioral Verification
        # ==========================

        all_detections = self.behavioral_verifier.enhance_detections(
            all_detections,
            log_file_path=log_file_path,
        )

        # ==========================
        # Stage 3: Correlation Logic
        # ==========================

        # Если найдено несколько SQL-инъекций в одном запросе —
        # усиливаем общий уровень доверия
        sql_detections = [d for d in all_detections if d["type"] == "SQL_INJECTION"]

        if len(sql_detections) >= 2:
            for detection in sql_detections:
                detection["multi_vector"] = True

        return all_detections
