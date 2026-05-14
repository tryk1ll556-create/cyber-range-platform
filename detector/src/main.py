#!/usr/bin/env python3
"""
Cyber Range Detection Engine
"""

import json
import httpx

from fastapi import (
    FastAPI,
    Request,
    HTTPException
)

from fastapi.responses import (
    HTMLResponse,
    Response
)

from fastapi.templating import Jinja2Templates

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from typing import (
    Dict,
    Any,
    Optional,
    List
)

from services.detection_pipeline import DetectionPipeline
from services.attack_session_tracker import AttackSessionTracker
from services.attack_timeline import AttackTimeline
from database.db_manager import DatabaseManager

# =====================================================
# FASTAPI
# =====================================================

app = FastAPI(
    title="Cyber Range Attack Detection Engine",
    version="4.0.0"
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# TEMPLATES
# =====================================================

templates = Jinja2Templates(directory="templates")

# =====================================================
# JUICE SHOP URL
# =====================================================

UPSTREAM = "http://localhost:8080"

# =====================================================
# REQUEST MODEL
# =====================================================

class AnalyzeRequest(BaseModel):

    method: str
    url: str
    params: Dict[str, Any] = {}
    headers: Optional[Dict[str, str]] = None
    sandbox_id: Optional[str] = None
    attacker_id: Optional[str] = "anonymous"

# =====================================================
# RISK ENGINE
# =====================================================

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

# =====================================================
# DETECTOR
# =====================================================

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
            "null_byte_attacks": 0,
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

        for d in detections:
            if d.get("type") == "POISON_NULL_BYTE":
                self.stats["null_byte_attacks"] += 1

        self.session_tracker.update_session(attacker_id, detections)
        session_analysis = self.session_tracker.analyze_session(attacker_id)

        if detections:
            self.stats["detected_attacks"] += 1
            self.stats["sql_injections"] += len([d for d in detections if d["type"] == "SQL_INJECTION"])
            self.stats["xss_attacks"] += len([d for d in detections if d["type"] == "XSS"])
            self.stats["path_traversals"] += len([d for d in detections if d["type"] == "PATH_TRAVERSAL"])

        request_id = self.db_manager.save_request(method, url, params, sandbox_id)
        if detections:
            self.db_manager.save_detections(request_id, detections)

        overall_risk = RiskScoringEngine.calculate_risk(detections)
        self.timeline.record_event(attacker_id, ip_address, user_agent, detections, overall_risk)

        return {
            "request_id": request_id,
            "overall_risk": overall_risk,
            "ip_address": ip_address,
            "attacker_id": attacker_id,
            "user_agent": user_agent,
            "detections": detections,
            "attack_session": session_analysis,
        }

    def get_stats(self):
        return self.stats

    def get_timeline(self):
        return self.timeline.get_timeline()

# =====================================================
# DETECTOR INSTANCE
# =====================================================

detector_engine = CyberRangeDetector()

# =====================================================
# ANALYZE ENDPOINT
# =====================================================

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

# =====================================================
# PROXY ENDPOINT
# =====================================================

@app.api_route("/proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_sandbox(request: Request, path: str):
    
    if "socket.io" in path:
        return Response(status_code=404, content="WebSocket not supported")
    
    url = f"{UPSTREAM}/{path}"
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("upgrade", None)
    headers.pop("connection", None)
    headers["accept-encoding"] = "identity"

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.request(
                method=request.method,
                url=url,
                content=body,
                headers=headers,
                params=request.query_params
            )

        # =================================================
        # DETECTOR ANALYSIS
        # =================================================

        try:
            payload = {}
            if body:
                try:
                    payload = json.loads(body.decode())
                except:
                    payload = {"raw_body": body.decode(errors="ignore")}

            combined_params = {**dict(request.query_params), **payload}
            
            # Берём attacker из query параметра или cookie или IP
            attacker_id = request.query_params.get("attacker")
            if not attacker_id:
                attacker_id = request.cookies.get("attacker")
            if not attacker_id:
                attacker_id = request.client.host

            if attacker_id != request.client.host:
                print(f"[AUTH] Attacker identified: {attacker_id} (IP: {request.client.host})")

            detector_engine.analyze_request(
                method=request.method,
                url=path,
                params=combined_params,
                sandbox_id="juice-shop",
                attacker_id=attacker_id,
                ip_address=request.client.host,
                user_agent=headers.get("user-agent", "unknown")
            )
        except Exception as detector_error:
            print("[DETECTOR ERROR]", detector_error)

        # =================================================
        # RETURN RESPONSE (с установкой cookie)
        # =================================================

        content_type = resp.headers.get("content-type", "text/html")
        
        # Создаём ответ
        response = Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=content_type
        )
        
        # Если в запросе был параметр attacker - сохраняем в cookie
        attacker_param = request.query_params.get("attacker")
        if attacker_param:
            response.set_cookie(
                key="attacker", 
                value=attacker_param, 
                max_age=3600, 
                path="/"
            )
            print(f"[COOKIE] Set attacker cookie: {attacker_param}")
        
        return response

    except Exception as e:
        print("[PROXY ERROR]", e)
        raise HTTPException(status_code=502, detail=str(e))

# =====================================================
# STATS
# =====================================================

@app.get("/stats")
def stats():
    return detector_engine.get_stats()

# =====================================================
# TIMELINE
# =====================================================

@app.get("/timeline")
def timeline():
    events = detector_engine.get_timeline()
    result = []
    for event in events:
        detections = event.get("detections", [])
        detection_strings = []
        for d in detections:
            if isinstance(d, dict):
                detection_strings.append(d.get("type", "UNKNOWN"))
            else:
                detection_strings.append(str(d))
        
        if detection_strings:
            result.append({
                "timestamp": event.get("timestamp"),
                "attacker_id": event.get("attacker_id", event.get("ip_address", "unknown")),
                "ip_address": event.get("ip_address", "unknown"),
                "risk": event.get("overall_risk", "LOW"),
                "detections": detection_strings
            })
    return result[::-1]

# =====================================================
# DASHBOARD
# =====================================================

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Cyber Range Detection Engine running",
        "proxy": "/proxy/",
        "dashboard": "/dashboard",
        "timeline": "/timeline",
        "stats": "/stats"
    }

# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("🚀 Cyber Range Detection Engine")
    print("=" * 60)
    print(f"🎯 Proxy target: {UPSTREAM}")
    print("📊 Dashboard: http://localhost:8001/dashboard")
    print("📈 Timeline:  http://localhost:8001/timeline")
    print("📈 Stats:     http://localhost:8001/stats")
    print("🔌 Proxy:     http://localhost:8001/proxy/")
    print("=" * 60)
    print("✅ Для первого входа используй: http://localhost:8001/proxy/?attacker=ТВОЙ_ЛОГИН#/")
    print("✅ После этого cookie сохранится автоматически")
    print("✅ Poison Null Byte атаки будут привязаны к твоему логину")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8001)