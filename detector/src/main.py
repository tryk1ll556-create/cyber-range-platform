#!/usr/bin/env python3
"""
Cyber Range Detection Engine
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from services.detection_pipeline import DetectionPipeline
from services.attack_session_tracker import AttackSessionTracker
from services.attack_timeline import AttackTimeline
from database.db_manager import DatabaseManager


app = FastAPI(title="Cyber Range Attack Detection Engine", version="2.6.0")

# Разрешаем запросы с фронтенда (порт 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")


class AnalyzeRequest(BaseModel):

    method: str
    url: str
    params: Dict[str, Any] = {}

    headers: Optional[Dict[str, str]] = None

    sandbox_id: Optional[str] = None
    attacker_id: Optional[str] = "anonymous"


class RiskScoringEngine:

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

            score = cls.risk_weights.get(detection["risk_level"], 1)

            if detection.get("multi_vector"):
                score += 1

            if detection.get("behavioral_confirmed"):
                score = 4

            max_score = max(max_score, score)

        for level, score in cls.risk_weights.items():
            if score == min(max_score, 4):
                return level

        return "LOW"


class CyberRangeDetector:

    def __init__(self):

        self.pipeline = DetectionPipeline()
        self.session_tracker = AttackSessionTracker()
        self.timeline = AttackTimeline()
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
        sandbox_id: Optional[str],
        attacker_id: str,
        ip_address: str,
        user_agent: str,
    ) -> Dict[str, Any]:

        self.stats["total_requests"] += 1

        detections = self.pipeline.analyze(method, url, params)

        self.session_tracker.update_session(attacker_id, detections)

        session_analysis = self.session_tracker.analyze_session(attacker_id)

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

        request_id = self.db_manager.save_request(method, url, params, sandbox_id)

        if detections:
            self.db_manager.save_detections(request_id, detections)

        overall_risk = RiskScoringEngine.calculate_risk(detections)

        self.timeline.record_event(
            attacker_id, ip_address, user_agent, detections, overall_risk
        )

        return {
            "request_id": request_id,
            "overall_risk": overall_risk,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "detections": detections,
            "attack_session": session_analysis,
        }

    def get_stats(self):
        return self.stats

    def get_timeline(self):
        return self.timeline.get_timeline()


detector_engine = CyberRangeDetector()


@app.post("/analyze")
def analyze(data: AnalyzeRequest, request: Request):

    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")

    return detector_engine.analyze_request(
        method=data.method,
        url=data.url,
        params=data.params,
        sandbox_id=data.sandbox_id,
        attacker_id=data.attacker_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )


@app.get("/stats")
def stats():
    return detector_engine.get_stats()


@app.get("/timeline")
def timeline():
    return detector_engine.get_timeline()


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/")
def root():
    return {"message": "Cyber Range Detection Engine running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)