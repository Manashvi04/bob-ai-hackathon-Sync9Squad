from datetime import datetime
from app.data.repository import repo
from app.models.assistant import AssistantQuery, AssistantResponse


class BobPortOperationsCopilot:
    def process_query(self, q: AssistantQuery) -> AssistantResponse:
        query_lower = q.query.lower().strip()
        vessels, total_vessels = repo.get_vessels(limit=250)
        berths = repo.get_berths()
        cranes = repo.get_cranes()
        yards = repo.get_yard_zones()
        alerts = repo.get_alerts(active_only=True)

        # Analysis metrics
        occupied_berths = [b for b in berths if b.status == "occupied"]
        at_berth_vessels = [v for v in vessels if v.status.value == "at_berth"]
        anchored_vessels = [v for v in vessels if v.status.value == "anchored"]
        critical_yards = [y for y in yards if y.risk_level == "critical" or y.utilization_pct >= 85.0]

        # Case 1: Berth conflicts or berth optimization
        if any(w in query_lower for w in ["berth", "quay", "dock", "conflict", "clash"]):
            answer = (
                f"**Berth Status & Analysis:**\n"
                f"Currently, {len(occupied_berths)} of {len(berths)} berths are occupied ({int(len(occupied_berths)/len(berths)*100)}% utilization). "
                f"There is an upcoming deep-draft conflict at **Berth B3** between delayed vessel *Nordic Star* and incoming *CMA CGM Palais Royal* (16.0m draft). "
                f"\n\n**Recommendation:**\n"
                f"1. Divert *CMA CGM Palais Royal* to **Berth B2**, which becomes clear at 13:00 following *Madrid Express*.\n"
                f"2. Run the **Auto-Optimiser** in the Berths & Cranes module to lock in conflict-free windows across all 8 berths."
            )
            suggested_actions = [
                "Open Berths & Cranes Optimiser",
                "Execute Berth B2 Reassignment",
                "View Berth B3 Timeline"
            ]
            related_metrics = {
                "Berth Occupancy": f"{len(occupied_berths)} / {len(berths)}",
                "Vessels Queued": f"{len(anchored_vessels)} awaiting berth",
                "Max Draft Berth": "Berth A1 (16.5m)"
            }

        # Case 2: Yard capacity or dwell time
        elif any(w in query_lower for w in ["yard", "dwell", "container", "stack", "y-04", "storage"]):
            crit_names = ", ".join([f"**{y.id}** ({y.name}, {y.utilization_pct}%)" for y in critical_yards]) or "None"
            answer = (
                f"**Yard Pressure Assessment:**\n"
                f"Terminal yard utilization is hovering at an average of 73.2%. However, critical hotspots exist in: {crit_names}.\n"
                f"**Zone Y-04 (Import)** is approaching 91% capacity with high automotive cargo dwell time (6.4 days average).\n\n"
                f"**Recommended Interventions:**\n"
                f"1. Trigger automated rebalancing: transfer 240 TEU from **Y-04** to buffer **Y-12**.\n"
                f"2. Authorize night-gate fee waivers to stimulate import pick-ups during off-peak Shift C."
            )
            suggested_actions = [
                "Execute Automated Yard Rebalancing (Y-04 -> Y-12)",
                "Review Yard Heatmap in Yard Module",
                "Broadcast Extended Gate Pass Alert"
            ]
            related_metrics = {
                "Critical Yard Zones": str(len(critical_yards)),
                "Peak Zone": "Y-04 (91.0%)",
                "Average Dwell": "4.1 days"
            }

        # Case 3: Cranes or crane allocation
        elif any(w in query_lower for w in ["crane", "qc", "gang", "handling", "speed"]):
            active_cranes = [c for c in cranes if c.status == "active"]
            maint_cranes = [c for c in cranes if c.status == "maintenance"]
            answer = (
                f"**Quay Crane Fleet Overview:**\n"
                f"Of 12 total quay cranes, **{len(active_cranes)} are actively operating**, **{len(maint_cranes)} in maintenance** (QC-07 on Berth B2), and the remainder on standby.\n"
                f"Quayside productivity is currently running at **32.4 gross moves per crane hour**.\n\n"
                f"**Actionable Advice:**\n"
                f"For the upcoming *Cosco Shipping Universe* (21,237 TEU), assign 3 Super Post-Panamax cranes (QC-01, QC-02, QC-03) with dual-cycling to maintain target turnaround within 28 hours."
            )
            suggested_actions = [
                "Inspect QC-07 Maintenance Status",
                "Assign 3-Crane Gang to Berth A1",
                "View Crane Efficiency Matrix"
            ]
            related_metrics = {
                "Active Cranes": f"{len(active_cranes)} / {len(cranes)}",
                "Average Gross Moves/Hr": "32.4",
                "Maintenance Crane": "QC-07"
            }

        # Case 4: Congestion or forecast or simulation
        elif any(w in query_lower for w in ["congestion", "hotspot", "forecast", "simulate", "peak"]):
            answer = (
                f"**Congestion Intelligence Briefing:**\n"
                f"Predicted terminal congestion score peaks at **91.0/100 today at 18:00 (Elevated Risk)**. "
                f"The primary driver is the arrival overlap of 3 Neo-Panamax vessels combined with high import container dwell time.\n\n"
                f"**Proactive Strategy:**\n"
                f"1. Apply **Virtual Arrival** on *Cosco Shipping Universe* to delay arrival by 3.5h, saving 18.4 tons of fuel and avoiding outer anchorage queue.\n"
                f"2. Stagger truck appointments between 16:00 and 20:00 to reduce gate queue index."
            )
            suggested_actions = [
                "Simulate Weather Surge in Congestion Module",
                "Issue Virtual Arrival Notices",
                "Review 72-Hour Congestion Curve"
            ]
            related_metrics = {
                "Peak Risk Window": "18:00 - 22:00 Tonight",
                "Peak Congestion Index": "91.0 / 100",
                "Delayed Vessels": f"{len([v for v in vessels if v.delay_hours > 1.0])} vessels"
            }

        # Case 5: General Port Operations Copilot Overview
        else:
            answer = (
                f"**PortFlowAI Operational Status Summary (North Harbor T1):**\n"
                f"- **Vessel Queue:** {len(at_berth_vessels)} at berth, {len(anchored_vessels)} at anchorage, {total_vessels} total tracked vessels.\n"
                f"- **Berth Utilization:** {len(occupied_berths)} of 8 berths working ({int(len(occupied_berths)/8*100)}%).\n"
                f"- **Active Alerts:** {len(alerts)} requiring supervisory action.\n"
                f"- **Priority Focus:** Congestion spike predicted at 18:00; recommend reviewing Alternate Routing recommendations and Berths & Cranes auto-allocation."
            )
            suggested_actions = [
                "View 72-Hour Operations Plan",
                "Run Auto-Optimiser for Berths & Cranes",
                "Check Active Operational Alerts"
            ]
            related_metrics = {
                "Tracked Vessels": str(total_vessels),
                "Berths Occupied": f"{len(occupied_berths)} / 8",
                "Active Alerts": str(len(alerts))
            }

        return AssistantResponse(
            answer=answer,
            suggested_actions=suggested_actions,
            related_metrics=related_metrics,
            confidence=0.96,
            timestamp=datetime.now().isoformat()
        )


bob_assistant = BobPortOperationsCopilot()
