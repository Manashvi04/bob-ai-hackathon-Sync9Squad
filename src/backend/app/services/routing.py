from app.models.routing import RoutingRecommendation, AlternateRoutingResponse
from app.data.repository import repo


class AlternateRoutingEngine:
    def __init__(self):
        self._recommendations: dict[str, RoutingRecommendation] = {}
        self._seed_recommendations()

    def _seed_recommendations(self):
        recs = [
            RoutingRecommendation(
                id="REC-01",
                vessel_id="VES-007",
                vessel_name="Cosco Shipping Universe",
                carrier="COSCO Shipping",
                strategy_type="Virtual Arrival",
                current_status="Inbound (Anchorage Bound)",
                original_eta="2026-09-16T04:00:00",
                recommended_eta="2026-09-16T07:30:00",
                fuel_saved_tons=18.4,
                co2_reduction_tons=57.6,
                cost_savings_usd=11960.0,
                delay_hours_mitigated=3.5,
                berth_window="Berth A1 (Available from 07:45)",
                rationale="Berth A1 is occupied until 07:15 by MV Pacific Dawn. Reducing speed from 19.5 to 16.2 knots absorbs waiting time at open sea and saves significant fuel.",
                action_label="Issue Virtual Arrival Notice",
                status="pending"
            ),
            RoutingRecommendation(
                id="REC-02",
                vessel_id="VES-008",
                vessel_name="CMA CGM Palais Royal",
                carrier="CMA CGM",
                strategy_type="Berth Swap",
                current_status="Waiting at Anchorage",
                original_eta="2026-09-16T12:00:00",
                recommended_eta="2026-09-16T14:30:00",
                fuel_saved_tons=9.2,
                co2_reduction_tons=28.8,
                cost_savings_usd=5980.0,
                delay_hours_mitigated=4.0,
                berth_window="Swap from Berth B3 to Berth B2",
                rationale="Berth B3 delayed by Nordic Star overtime. Berth B2 completes Madrid Express early at 13:00 with adequate draft clearance for Neo-Panamax.",
                action_label="Confirm Berth B2 Swap",
                status="pending"
            ),
            RoutingRecommendation(
                id="REC-03",
                vessel_id="VES-009",
                vessel_name="ONE Apus",
                carrier="Ocean Network Express (ONE)",
                strategy_type="Virtual Arrival",
                current_status="Inbound Eastbound",
                original_eta="2026-09-16T14:00:00",
                recommended_eta="2026-09-16T16:30:00",
                fuel_saved_tons=14.1,
                co2_reduction_tons=44.1,
                cost_savings_usd=9165.0,
                delay_hours_mitigated=2.5,
                berth_window="Berth B1 (Available from 16:30)",
                rationale="Allows Berth B1 quay cranes QC-05 and QC-06 to finish outbound lashing without vessel holding at Outer Anchorage.",
                action_label="Send Speed Reduction Request",
                status="pending"
            ),
            RoutingRecommendation(
                id="REC-04",
                vessel_id="VES-022",
                vessel_name="Ocean Meridian",
                carrier="CMA CGM",
                strategy_type="Feeder Divert",
                current_status="At Berth C2",
                original_eta="2026-09-15T10:00:00",
                recommended_eta="2026-09-15T11:00:00",
                fuel_saved_tons=4.5,
                co2_reduction_tons=14.0,
                cost_savings_usd=2925.0,
                delay_hours_mitigated=2.0,
                berth_window="Berth C3 Secondary Dock",
                rationale="Divert follow-on regional transshipment boxes to Berth C3 to relieve Berth C2 queue for upcoming European feeder call.",
                action_label="Authorize Feeder Re-route",
                status="applied"
            ),
            RoutingRecommendation(
                id="REC-05",
                vessel_id="VES-010",
                vessel_name="HMM Algeciras",
                carrier="HMM",
                strategy_type="Discharge Resequence",
                current_status="Scheduled Day 2",
                original_eta="2026-09-17T06:00:00",
                recommended_eta="2026-09-17T07:45:00",
                fuel_saved_tons=16.8,
                co2_reduction_tons=52.5,
                cost_savings_usd=10920.0,
                delay_hours_mitigated=3.0,
                berth_window="Berth A2 Primary Gantry",
                rationale="Pre-clear high-priority intermodal rail containers to Bay 14-22 for direct tractor-to-rail loading, cutting yard re-handling by 35%.",
                action_label="Approve Hotbox Discharge Sequence",
                status="pending"
            )
        ]
        self._recommendations = {r.id: r for r in recs}

    def get_recommendations(self) -> AlternateRoutingResponse:
        recs = list(self._recommendations.values())
        total_fuel = sum(r.fuel_saved_tons for r in recs)
        total_co2 = sum(r.co2_reduction_tons for r in recs)
        total_cost = sum(r.cost_savings_usd for r in recs)

        return AlternateRoutingResponse(
            total_fuel_saved_tons=round(total_fuel, 1),
            total_co2_reduction_tons=round(total_co2, 1),
            total_cost_savings_usd=round(total_cost, 0),
            high_impact_vessels_count=len(recs),
            recommendations=recs
        )

    def apply_recommendation(self, rec_id: str) -> bool:
        rec = self._recommendations.get(rec_id)
        if not rec:
            return False
        rec.status = "applied"
        v = repo.get_vessel(rec.vessel_id)
        if v:
            from app.models.vessel import VesselUpdate
            repo.update_vessel(v.id, VesselUpdate(
                eta=rec.recommended_eta,
                delay_hours=max(0.0, v.delay_hours - rec.delay_hours_mitigated),
            ))
        return True


routing_engine = AlternateRoutingEngine()
