#!/usr/bin/env python3
"""
ГЛАВНЫЙ МОДУЛЬ API СИСТЕМЫ ДЕТЕКТИРОВАНИЯ АТАК
Production-архитектура с Multi-Stage Detection Pipeline
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from services.detection_pipeline import DetectionPipeline
from database.db_manager import DatabaseManager


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="Cyber Range Attack Detection Engine",
    version="2.1.0",
    description="Модульная система интеллектуального детектирования атак (Multi-Stage)",
)


# =====================================================
# REQUEST MODEL
# =====================================================


class AnalyzeRequest(BaseModel):
    method: str
    url: str
    params: Dict[str, Any] = {}
    headers: Optional[Dict[str, str]] = None
    sandbox_id: Optional[str] = None


# =====================================================
# RISK SCORING ENGINE
# =====================================================


class RiskScoringEngine:
    """
    Центральный механизм вычисления итогового уровня риска.
    Учитывает multi_vector и behavioral_confirmed.
    """

    risk_weights = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 4,
    }

    @classmethod
    def calculate_risk(cls, detections: List[Dict[str, Any]]) -> str:
        if not detections:
            return "LOW"

        max_score = 0

        for detection in detections:
            base_score = cls.risk_weights.get(detection["risk_level"], 1)

            # Усиление за multi-vector атаку
            if detection.get("multi_vector"):
                base_score += 1

            # Усиление за подтверждённую эксплуатацию
            if detection.get("behavioral_confirmed"):
                base_score = 4  # автоматически CRITICAL

            max_score = max(max_score, base_score)

        for level, score in cls.risk_weights.items():
            if score == min(max_score, 4):
                return level

        return "LOW"


# =====================================================
# CORE ENGINE
# =====================================================


class CyberRangeDetector:

    def __init__(self):
        self.pipeline = DetectionPipeline()
        self.db_manager = DatabaseManager()
        self.stats = {
            "total_requests": 0,
            "detected_attacks": 0,
            "sql_injections": 0,
            "xss_attacks": 0,
            "path_traversals": 0,
        }

    def analyze_request(
        self,
        method: str,
        url: str,
        params: Dict[str, Any],
        sandbox_id: Optional[str] = None,
    ) -> Dict[str, Any]:

        self.stats["total_requests"] += 1

        # === Формирование пути к логам песочницы ===
        log_file_path = None
        if sandbox_id:
            log_file_path = f"../../sandboxes/{sandbox_id}/logs/access.log"

        # === Запуск multi-stage pipeline ===
        detections = self.pipeline.analyze(
            method,
            url,
            params,
            log_file_path=log_file_path,
        )

        # === Подсчёт статистики ===
        if detections:
            self.stats["detected_attacks"] += 1
            self.stats["sql_injections"] += len(
                [d for d in detections if d["type"] == "SQL_INJECTION"]
            )
            self.stats["xss_attacks"] += len(
                [d for d in detections if d["type"] == "XSS"]
            )
            self.stats["path_traversals"] += len(
                [d for d in detections if d["type"] == "PATH_TRAVERSAL"]
            )

        # === Сохранение в БД ===
        request_id = self.db_manager.save_request(method, url, params, sandbox_id)

        if detections:
            self.db_manager.save_detections(request_id, detections)

        self.db_manager.update_statistics(
            {
                "total_requests": 1,
                "detected_attacks": 1 if detections else 0,
                "sql_injections": len(
                    [d for d in detections if d["type"] == "SQL_INJECTION"]
                ),
                "xss_attacks": len([d for d in detections if d["type"] == "XSS"]),
                "path_traversals": len(
                    [d for d in detections if d["type"] == "PATH_TRAVERSAL"]
                ),
            }
        )

        # === Risk Scoring (Adaptive) ===
        overall_risk = RiskScoringEngine.calculate_risk(detections)

        return {
            "request_id": request_id,
            "overall_risk": overall_risk,
            "total_detections": len(detections),
            "detections": detections,
        }

    def get_stats(self):
        return self.stats


# =====================================================
# INITIALIZATION
# =====================================================

detector_engine = CyberRangeDetector()


# =====================================================
# API ENDPOINTS
# =====================================================


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    return detector_engine.analyze_request(
        method=request.method,
        url=request.url,
        params=request.params,
        sandbox_id=request.sandbox_id,
    )


@app.get("/stats")
def stats():
    return detector_engine.get_stats()


@app.get("/")
def root():
    return {
        "message": "Cyber Range Detection Engine v2.1 работает (Multi-Stage Active)"
    }
