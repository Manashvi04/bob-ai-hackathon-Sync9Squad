from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.data.repository import repo
from app.models.vessel import Vessel, VesselCreate, VesselUpdate
from app.models.berth import Berth
from app.models.crane import QuayCrane
from app.models.yard import YardZone
from app.models.congestion import CongestionForecastResponse, SimulationRequest, SimulationResult
from app.models.optimization import OptimizationRequest, OptimizationResult
from app.models.plan import Plan72HourResponse
from app.models.alert import OperationalAlert
from app.models.routing import AlternateRoutingResponse
from app.models.assistant import AssistantQuery, AssistantResponse
from app.services.prediction import prediction_engine
from app.services.optimisation import optimiser
from app.services.planning import operations_planner
from app.services.routing import routing_engine
from app.services.ai_assistant import bob_assistant

api_router = APIRouter()


@api_router.get("/", tags=["system"])
async def api_root() -> dict[str, str]:
    return {
        "service": "PortFlowAI Operations Command API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# ==========================================
# 1. Vessels Module API
# ==========================================
@api_router.get("/vessels", tags=["vessels"])
async def list_vessels(
    search: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    carrier: Optional[str] = None,
    vessel_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
) -> dict:
    vessels, total = repo.get_vessels(
        search=search,
        status=status,
        risk_level=risk_level,
        carrier=carrier,
        vessel_type=vessel_type,
        limit=limit,
        offset=offset
    )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "vessels": vessels
    }


@api_router.get("/vessels/{vessel_id}", response_model=Vessel, tags=["vessels"])
async def get_vessel(vessel_id: str) -> Vessel:
    v = repo.get_vessel(vessel_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return v


@api_router.post("/vessels", response_model=Vessel, tags=["vessels"])
async def create_vessel(vessel: VesselCreate) -> Vessel:
    return repo.add_vessel(vessel)


@api_router.put("/vessels/{vessel_id}", response_model=Vessel, tags=["vessels"])
async def update_vessel(vessel_id: str, updates: VesselUpdate) -> Vessel:
    v = repo.update_vessel(vessel_id, updates)
    if not v:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return v


# ==========================================
# 2. Berths & Cranes Module API
# ==========================================
@api_router.get("/berths", response_model=list[Berth], tags=["berths"])
async def list_berths() -> list[Berth]:
    return repo.get_berths()


@api_router.get("/cranes", response_model=list[QuayCrane], tags=["cranes"])
async def list_cranes() -> list[QuayCrane]:
    return repo.get_cranes()


@api_router.post("/optimisation/run", response_model=OptimizationResult, tags=["optimisation"])
async def run_berth_crane_optimization(req: OptimizationRequest = OptimizationRequest()) -> OptimizationResult:
    return optimiser.optimize(req)


# ==========================================
# 3. Congestion Prediction Module API
# ==========================================
@api_router.get("/congestion/forecast", response_model=CongestionForecastResponse, tags=["congestion"])
async def get_congestion_forecast() -> CongestionForecastResponse:
    return prediction_engine.get_forecast()


@api_router.post("/congestion/simulate", response_model=SimulationResult, tags=["congestion"])
async def simulate_congestion(req: SimulationRequest) -> SimulationResult:
    return prediction_engine.simulate(req)


# ==========================================
# 4. Yard Capacity Module API
# ==========================================
@api_router.get("/yard", response_model=list[YardZone], tags=["yard"])
async def list_yard_zones() -> list[YardZone]:
    return repo.get_yard_zones()


@api_router.post("/yard/rebalance", tags=["yard"])
async def rebalance_yard(source_id: str = "Y-04", target_id: str = "Y-12", teu_to_move: int = 240) -> dict:
    res = repo.rebalance_yard_zone(source_id, target_id, teu_to_move)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res


# ==========================================
# 5. Alternate Routing Module API
# ==========================================
@api_router.get("/routing", response_model=AlternateRoutingResponse, tags=["routing"])
async def get_routing_recommendations() -> AlternateRoutingResponse:
    return routing_engine.get_recommendations()


@api_router.post("/routing/{rec_id}/apply", tags=["routing"])
async def apply_routing_recommendation(rec_id: str) -> dict:
    ok = routing_engine.apply_recommendation(rec_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {"status": "success", "message": f"Recommendation {rec_id} applied to live vessel schedule."}


# ==========================================
# 6. 72-Hour Shift Operations Plan API
# ==========================================
@api_router.get("/plan/72-hour", response_model=Plan72HourResponse, tags=["plan"])
async def get_72_hour_plan() -> Plan72HourResponse:
    return operations_planner.generate_72h_plan()


# ==========================================
# 7. Operational Alerts Module API
# ==========================================
@api_router.get("/alerts", response_model=list[OperationalAlert], tags=["alerts"])
async def list_alerts(active_only: bool = False) -> list[OperationalAlert]:
    return repo.get_alerts(active_only=active_only)


@api_router.post("/alerts/{alert_id}/resolve", response_model=OperationalAlert, tags=["alerts"])
async def resolve_alert(alert_id: str) -> OperationalAlert:
    a = repo.resolve_alert(alert_id)
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    return a


# ==========================================
# 8. IBM Bob AI Copilot Assistant API
# ==========================================
@api_router.post("/assistant/query", response_model=AssistantResponse, tags=["assistant"])
async def query_assistant(q: AssistantQuery) -> AssistantResponse:
    return bob_assistant.process_query(q)


# ==========================================
# 9. Global Analytics & Data Admin
# ==========================================
@api_router.get("/analytics/summary", tags=["analytics"])
async def get_terminal_summary() -> dict:
    vessels, total = repo.get_vessels(limit=250)
    berths = repo.get_berths()
    cranes = repo.get_cranes()
    yard = repo.get_yard_zones()
    alerts = repo.get_alerts(active_only=True)

    occupied_berths = sum(1 for b in berths if b.status == "occupied")
    at_berth = sum(1 for v in vessels if v.status.value == "at_berth")
    anchored = sum(1 for v in vessels if v.status.value == "anchored")
    critical_vessels = sum(1 for v in vessels if v.risk_level.value == "critical")
    active_cranes = sum(1 for c in cranes if c.status == "active")
    avg_yard_util = round(sum(y.utilization_pct for y in yard) / max(1, len(yard)), 1)

    return {
        "terminal_name": "North Harbor Terminal 1",
        "total_tracked_vessels": total,
        "vessels_at_berth": at_berth,
        "vessels_anchored": anchored,
        "critical_risk_vessels": critical_vessels,
        "berth_utilization_pct": round((occupied_berths / max(1, len(berths))) * 100, 1),
        "occupied_berths": occupied_berths,
        "total_berths": len(berths),
        "active_cranes": active_cranes,
        "total_cranes": len(cranes),
        "yard_capacity_pct": avg_yard_util,
        "active_alerts_count": len(alerts),
        "system_status": "Operational · Live AI Optimization Active"
    }


@api_router.post("/data/reset", tags=["system"])
async def reset_sample_data() -> dict:
    repo.reset()
    return {"status": "success", "message": "Sample dataset reloaded with 225+ realistic vessel calls."}
