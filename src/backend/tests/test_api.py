from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_root():
    response = client.get("/api/v1/")
    assert response.status_code == 200
    assert "PortFlowAI" in response.json()["service"]


def test_vessels_list_200_plus():
    response = client.get("/api/v1/vessels?limit=300")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 200
    assert len(data["vessels"]) >= 200
    # Check vessel structure
    first_vessel = data["vessels"][0]
    assert "name" in first_vessel
    assert "imo" in first_vessel
    assert "carrier" in first_vessel
    assert "teu_capacity" in first_vessel
    assert "draft_m" in first_vessel
    assert "congestion_score" in first_vessel


def test_vessel_filters():
    # Search
    response = client.get("/api/v1/vessels?search=Pacific")
    assert response.status_code == 200
    vessels = response.json()["vessels"]
    assert any("Pacific" in v["name"] for v in vessels)

    # Status filter
    response_berth = client.get("/api/v1/vessels?status=at_berth")
    assert response_berth.status_code == 200
    for v in response_berth.json()["vessels"]:
        assert v["status"] == "at_berth"


def test_berths_and_cranes():
    res_b = client.get("/api/v1/berths")
    assert res_b.status_code == 200
    berths = res_b.json()
    assert len(berths) == 8

    res_c = client.get("/api/v1/cranes")
    assert res_c.status_code == 200
    cranes = res_c.json()
    assert len(cranes) == 12


def test_congestion_forecast_and_simulate():
    res_f = client.get("/api/v1/congestion/forecast")
    assert res_f.status_code == 200
    forecast = res_f.json()
    assert "forecast_points" in forecast
    assert len(forecast["forecast_points"]) >= 15
    assert "hotspots" in forecast
    assert len(forecast["hotspots"]) >= 3

    # Simulation
    res_sim = client.post("/api/v1/congestion/simulate", json={
        "arrival_surge_pct": 20.0,
        "crane_efficiency_pct": 80.0,
        "adverse_weather": True
    })
    assert res_sim.status_code == 200
    sim = res_sim.json()
    assert sim["simulated_congestion_score"] > sim["baseline_congestion_score"]
    assert len(sim["mitigation_steps"]) >= 2


def test_optimisation():
    res_opt = client.post("/api/v1/optimisation/run", json={
        "prioritize_express": True,
        "max_cranes_per_vessel": 4
    })
    assert res_opt.status_code == 200
    opt = res_opt.json()
    assert opt["total_vessels_optimized"] > 0
    assert opt["average_waiting_time_reduction_pct"] > 0
    assert len(opt["assignments"]) > 0


def test_yard_and_rebalance():
    res_y = client.get("/api/v1/yard")
    assert res_y.status_code == 200
    zones = res_y.json()
    assert len(zones) == 18

    # Rebalance
    res_reb = client.post("/api/v1/yard/rebalance?source_id=Y-04&target_id=Y-12&teu_to_move=200")
    assert res_reb.status_code == 200
    assert res_reb.json()["moved_teu"] == 200


def test_alternate_routing():
    res_r = client.get("/api/v1/routing")
    assert res_r.status_code == 200
    routing = res_r.json()
    assert routing["total_fuel_saved_tons"] > 0
    assert len(routing["recommendations"]) >= 4

    # Apply recommendation
    first_rec = routing["recommendations"][0]["id"]
    res_apply = client.post(f"/api/v1/routing/{first_rec}/apply")
    assert res_apply.status_code == 200


def test_72_hour_plan():
    res_p = client.get("/api/v1/plan/72-hour")
    assert res_p.status_code == 200
    plan = res_p.json()
    assert len(plan["shifts"]) == 9
    assert plan["total_planned_moves"] > 10000


def test_alerts():
    res_a = client.get("/api/v1/alerts")
    assert res_a.status_code == 200
    alerts = res_a.json()
    assert len(alerts) >= 5

    first_id = alerts[0]["id"]
    res_res = client.post(f"/api/v1/alerts/{first_id}/resolve")
    assert res_res.status_code == 200
    assert res_res.json()["is_resolved"] is True


def test_assistant():
    res_ass = client.post("/api/v1/assistant/query", json={
        "query": "Which berths have conflicts tomorrow?"
    })
    assert res_ass.status_code == 200
    ass = res_ass.json()
    assert "Berth" in ass["answer"]
    assert len(ass["suggested_actions"]) > 0


def test_analytics_summary():
    res_sum = client.get("/api/v1/analytics/summary")
    assert res_sum.status_code == 200
    data = res_sum.json()
    assert data["total_tracked_vessels"] >= 200
    assert data["total_berths"] == 8
    assert data["total_cranes"] == 12
