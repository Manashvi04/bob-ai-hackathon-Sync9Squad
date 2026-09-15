import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from app.data.repository import repo
from app.models.congestion import (
    HourlyCongestion,
    HotspotZone,
    CongestionForecastResponse,
    SimulationRequest,
    SimulationResult
)
from app.models.vessel import RiskLevel


class CongestionPredictionEngine:
    def __init__(self):
        self._is_trained = False
        self._regressor = RandomForestRegressor(n_estimators=40, random_state=42)
        self._classifier = RandomForestClassifier(n_estimators=40, random_state=42)
        self._train_engine()

    def _train_engine(self):
        # Generate synthetic training samples based on maritime terminal physics
        # Features: [total_moves, teu_capacity, draft_m, length_m, berth_occ_pct, yard_occ_pct, crane_eff, weather_factor]
        np.random.seed(42)
        n_samples = 600

        moves = np.random.uniform(300, 7500, n_samples)
        teu_cap = np.random.uniform(1500, 24000, n_samples)
        draft = np.random.uniform(9.0, 16.5, n_samples)
        length = np.random.uniform(150.0, 400.0, n_samples)
        berth_occ = np.random.uniform(40.0, 95.0, n_samples)
        yard_occ = np.random.uniform(45.0, 95.0, n_samples)
        crane_eff = np.random.uniform(65.0, 100.0, n_samples)
        weather = np.random.choice([0.0, 0.5, 1.0], size=n_samples, p=[0.7, 0.2, 0.1])

        X = np.column_stack([moves, teu_cap, draft, length, berth_occ, yard_occ, crane_eff, weather])

        # Mathematical ground-truth function for congestion index (0 to 100)
        y_score = (
            (moves / 7500.0) * 25.0 +
            (berth_occ / 100.0) * 30.0 +
            (yard_occ / 100.0) * 25.0 +
            ((100.0 - crane_eff) / 35.0) * 12.0 +
            weather * 8.0
        )
        y_score = np.clip(y_score + np.random.normal(0, 2.5, n_samples), 10.0, 99.0)

        # Classify into 0: Low (<45), 1: Medium (45-69), 2: High (70-84), 3: Critical (>=85)
        y_class = np.zeros(n_samples, dtype=int)
        y_class[y_score >= 45.0] = 1
        y_class[y_score >= 70.0] = 2
        y_class[y_score >= 85.0] = 3

        self._regressor.fit(X, y_score)
        self._classifier.fit(X, y_class)
        self._is_trained = True

    def predict_score(self, total_moves: int, teu_capacity: int, draft_m: float, length_m: float,
                      berth_occ: float, yard_occ: float, crane_eff: float, weather: float) -> tuple[float, str]:
        features = np.array([[total_moves, teu_capacity, draft_m, length_m, berth_occ, yard_occ, crane_eff, weather]])
        score = float(self._regressor.predict(features)[0])
        cls_idx = int(self._classifier.predict(features)[0])
        risk_map = {0: "low", 1: "medium", 2: "high", 3: "critical"}
        return round(score, 1), risk_map.get(cls_idx, "medium")

    def get_forecast(self) -> CongestionForecastResponse:
        base_time = datetime(2026, 9, 15, 14, 0, 0)
        berths = repo.get_berths()
        yards = repo.get_yard_zones()
        avg_yard = np.mean([y.utilization_pct for y in yards])
        avg_berth = np.mean([b.utilization_pct for b in berths])

        # 72 hours in 4-hour increments (19 data points)
        points: list[HourlyCongestion] = []
        peak_score = 0.0
        peak_time = "18:00"

        # Realistic diurnal traffic wave with peak in evening (18:00 - 22:00)
        for i in range(0, 73, 4):
            dt = base_time + timedelta(hours=i)
            time_str = dt.strftime("%a %H:00") if i >= 24 else dt.strftime("%H:00")
            hour_of_day = dt.hour

            # Day cycle effect: peak in late afternoon / evening
            diurnal = np.sin((hour_of_day - 6) / 24.0 * 2 * np.pi) * 12.0
            noise = np.sin(i * 0.45) * 4.0

            b_cong = np.clip(avg_berth + diurnal + noise + (i * 0.08), 35.0, 96.0)
            y_press = np.clip(avg_yard + (diurnal * 0.6) + (i * 0.1), 40.0, 94.0)
            c_demand = np.clip(70.0 + diurnal * 1.2, 30.0, 98.0)

            overall = round((b_cong * 0.45) + (y_press * 0.35) + (c_demand * 0.20), 1)

            if overall > peak_score:
                peak_score = overall
                peak_time = time_str

            risk = (
                "critical" if overall >= 85.0 else
                "high" if overall >= 72.0 else
                "medium" if overall >= 50.0 else
                "low"
            )

            points.append(HourlyCongestion(
                time=time_str,
                hour_offset=i,
                utilisation=overall,
                threshold=85.0,
                berth_congestion=round(b_cong, 1),
                yard_pressure=round(y_press, 1),
                crane_demand=round(c_demand, 1),
                risk_level=risk,
                vessels_at_berth=min(8, int(8 * (b_cong / 100.0))),
                vessels_waiting=max(1, int(6 * (b_cong / 100.0) - 1))
            ))

        hotspots = self.get_hotspots()

        return CongestionForecastResponse(
            current_index=round(points[0].utilisation, 1),
            status="Elevated Risk · Evening Peak Expected",
            peak_forecast_time=peak_time,
            peak_forecast_index=round(peak_score, 1),
            forecast_points=points,
            hotspots=hotspots,
            contributing_factors_summary={
                "Berth Berth Occupancy": 42.0,
                "Yard Dwell Time Pressure": 28.0,
                "Quay Crane Fleet Availability": 18.0,
                "Arrival Schedule Clumping": 12.0
            }
        )

    def get_hotspots(self) -> list[HotspotZone]:
        return [
            HotspotZone(
                id="HS-01",
                name="Berth B3 Deep-Draft Conflict",
                type="berth",
                severity="critical",
                current_load_pct=92.0,
                peak_time="Today 18:00 - 23:00",
                contributing_factors=[
                    "Delayed departure of Nordic Star (+3.2h)",
                    "Incoming CMA CGM Palais Royal draft requirement (16.0m)",
                    "Limited high-draft alternative berths available"
                ],
                recommendation="Resequence Nordic Star crane gang allocation to complete cargo 1.5h earlier."
            ),
            HotspotZone(
                id="HS-02",
                name="Yard Zone Y-04 (Import Block)",
                type="yard",
                severity="critical",
                current_load_pct=91.0,
                peak_time="Tonight 19:30",
                contributing_factors=[
                    "High dwell time for automotive parts containers (avg 6.4 days)",
                    "Inbound discharge from MV Pacific Dawn (1,200 TEU)",
                    "Rail departure batch delayed by 4 hours"
                ],
                recommendation="Transfer 240 TEU to buffer Yard Zone Y-12 to maintain crane access aisles."
            ),
            HotspotZone(
                id="HS-03",
                name="Berth A1 Crane Interference",
                type="berth",
                severity="high",
                current_load_pct=85.0,
                peak_time="Tomorrow 04:00",
                contributing_factors=[
                    "Simultaneous double-hoist operations on 24k TEU vessel",
                    "Quay Crane QC-03 shared rail margin restriction"
                ],
                recommendation="Stagger hatch work sequence between Bays 24 and 36."
            ),
            HotspotZone(
                id="HS-04",
                name="Inbound Gate Lanes 3-5",
                type="gate",
                severity="medium",
                current_load_pct=78.0,
                peak_time="Tomorrow 08:00 - 11:00",
                contributing_factors=[
                    "Morning export truck surge",
                    "Customs EDI pre-clearance backlog"
                ],
                recommendation="Activate reserve Gate Lane 6 and enable automated QR gate passes."
            )
        ]

    def simulate(self, req: SimulationRequest) -> SimulationResult:
        baseline_forecast = self.get_forecast()
        base_avg = baseline_forecast.current_index

        # Simulation physics
        surge_impact = (req.arrival_surge_pct / 100.0) * 18.0
        crane_drop_impact = ((100.0 - req.crane_efficiency_pct) / 100.0) * 22.0
        weather_impact = 12.5 if req.adverse_weather else 0.0
        yard_impact = (req.yard_dwell_multiplier - 1.0) * 15.0
        berth_closure_impact = len(req.berth_closure_ids) * 7.5

        delta = round(surge_impact + crane_drop_impact + weather_impact + yard_impact + berth_closure_impact, 1)
        simulated_score = round(min(99.5, max(15.0, base_avg + delta)), 1)
        delayed_vessels = max(0, int(len(repo.get_berths()) * 1.5 + (delta / 4.0)))
        additional_hours = round(max(0.0, delta * 0.28), 1)

        simulated_points: list[HourlyCongestion] = []
        for p in baseline_forecast.forecast_points:
            sim_util = round(min(99.0, max(20.0, p.utilisation + delta * (0.8 + 0.4 * np.sin(p.hour_offset * 0.2)))), 1)
            sim_risk = (
                "critical" if sim_util >= 85.0 else
                "high" if sim_util >= 72.0 else
                "medium" if sim_util >= 50.0 else
                "low"
            )
            simulated_points.append(HourlyCongestion(
                time=p.time,
                hour_offset=p.hour_offset,
                utilisation=sim_util,
                threshold=85.0,
                berth_congestion=round(min(99.0, p.berth_congestion + delta * 0.9), 1),
                yard_pressure=round(min(99.0, p.yard_pressure + delta * 0.85), 1),
                crane_demand=round(min(99.0, p.crane_demand + delta * 0.7), 1),
                risk_level=sim_risk,
                vessels_at_berth=min(8, p.vessels_at_berth + (1 if delta > 8 else 0)),
                vessels_waiting=p.vessels_waiting + max(1, int(delta / 6.0))
            ))

        impacted_berths = ["Berth B3", "Berth B1"]
        if req.adverse_weather or delta > 10.0:
            impacted_berths.extend(["Berth A1", "Berth A2"])

        mitigations = [
            f"Activate Virtual Arrival protocol for {delayed_vessels} queued vessels to save {round(delayed_vessels * 14.5, 1)} MT fuel.",
            "Reallocate 2 standby crane gangs from preventive maintenance to Shift B quayside operations.",
            "Authorize night-gate free dwell windows to siphon 380 TEU out of Yard Zone Y-04.",
            "Trigger secondary feeder bypass to Berth C3 for regional carriers."
        ]

        return SimulationResult(
            baseline_congestion_score=base_avg,
            simulated_congestion_score=simulated_score,
            delta_pct=round(delta, 1),
            peak_congestion_time="Simulated 20:00 (Evening Surge)",
            vessels_delayed_count=delayed_vessels,
            additional_delay_hours=additional_hours,
            impacted_berths=impacted_berths,
            simulated_hourly_forecast=simulated_points,
            mitigation_steps=mitigations
        )


prediction_engine = CongestionPredictionEngine()
