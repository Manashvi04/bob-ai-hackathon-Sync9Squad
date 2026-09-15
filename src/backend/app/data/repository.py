"""
In-memory data repository for PortOps Command Center.
Provides seeded sample data and CRUD helpers used by the API router.
"""
from __future__ import annotations

import uuid
from typing import Optional

from app.models.alert import AlertSeverity, OperationalAlert
from app.models.berth import Berth
from app.models.crane import QuayCrane
from app.models.vessel import RiskLevel, Vessel, VesselCreate, VesselStatus, VesselType
from app.models.yard import YardZone


def _seed_vessels() -> list[Vessel]:
    raw = [
        dict(id="V-001", name="MSC Gulsun", imo="IMO9811000", call_sign="9HCH5", flag="Panama",
             carrier="MSC", vessel_type=VesselType.ULCV, teu_capacity=23756,
             length_overall_m=399.9, beam_m=61.5, draft_m=16.0,
             inbound_teu=6240, outbound_teu=5810, total_moves=12050,
             eta="2026-07-25T06:00:00Z", etd="2026-07-27T18:00:00Z",
             actual_arrival="2026-07-25T06:45:00Z", status=VesselStatus.AT_BERTH,
             assigned_berth="B-01", assigned_cranes=["QC-01", "QC-02", "QC-03"],
             congestion_score=0.82, risk_level=RiskLevel.HIGH, delay_hours=2.5,
             origin_port="Tanjung Pelepas", destination_port="Rotterdam",
             priority="express", dwell_time_hours=36.0,
             recommended_action="Assign 4th crane to accelerate unload"),
        dict(id="V-002", name="CSCL Globe", imo="IMO9695645", call_sign="BOFG7", flag="Hong Kong",
             carrier="COSCO", vessel_type=VesselType.ULCV, teu_capacity=19100,
             length_overall_m=400.0, beam_m=58.6, draft_m=15.5,
             inbound_teu=5100, outbound_teu=4700, total_moves=9800,
             eta="2026-07-26T08:00:00Z", etd="2026-07-29T12:00:00Z",
             status=VesselStatus.ANCHORED,
             congestion_score=0.74, risk_level=RiskLevel.HIGH, delay_hours=5.0,
             origin_port="Shanghai", destination_port="Hamburg",
             priority="high", dwell_time_hours=0.0,
             recommended_action="Prepare B-02 for arrival in 4h"),
        dict(id="V-003", name="Ever Ace", imo="IMO9893890", call_sign="BRNL7", flag="Panama",
             carrier="Evergreen", vessel_type=VesselType.ULCV, teu_capacity=23992,
             length_overall_m=400.0, beam_m=61.5, draft_m=16.0,
             inbound_teu=7100, outbound_teu=6500, total_moves=13600,
             eta="2026-07-28T04:00:00Z", etd="2026-07-31T20:00:00Z",
             status=VesselStatus.SCHEDULED,
             congestion_score=0.55, risk_level=RiskLevel.MEDIUM, delay_hours=0.0,
             origin_port="Kaohsiung", destination_port="Felixstowe",
             priority="normal", dwell_time_hours=0.0),
        dict(id="V-004", name="CMA CGM Jacques Saade", imo="IMO9839430", call_sign="FMAZ9",
             flag="France", carrier="CMA CGM", vessel_type=VesselType.ULCV, teu_capacity=23112,
             length_overall_m=399.0, beam_m=61.0, draft_m=16.0,
             inbound_teu=5800, outbound_teu=5400, total_moves=11200,
             eta="2026-07-25T14:00:00Z", etd="2026-07-28T08:00:00Z",
             actual_arrival="2026-07-25T14:10:00Z", status=VesselStatus.AT_BERTH,
             assigned_berth="B-02", assigned_cranes=["QC-04", "QC-05"],
             congestion_score=0.61, risk_level=RiskLevel.MEDIUM, delay_hours=0.0,
             origin_port="Le Havre", destination_port="Singapore",
             priority="normal", dwell_time_hours=28.0),
        dict(id="V-005", name="HMM Algeciras", imo="IMO9863297", call_sign="D7SK8", flag="South Korea",
             carrier="HMM", vessel_type=VesselType.ULCV, teu_capacity=23964,
             length_overall_m=399.9, beam_m=61.0, draft_m=15.8,
             inbound_teu=4900, outbound_teu=4600, total_moves=9500,
             eta="2026-07-27T10:00:00Z", etd="2026-07-30T06:00:00Z",
             status=VesselStatus.SCHEDULED,
             congestion_score=0.45, risk_level=RiskLevel.LOW, delay_hours=0.0,
             origin_port="Busan", destination_port="Rotterdam",
             priority="normal", dwell_time_hours=0.0),
        dict(id="V-006", name="MSC Oscar", imo="IMO9703291", call_sign="9HA4571", flag="Panama",
             carrier="MSC", vessel_type=VesselType.ULCV, teu_capacity=19224,
             length_overall_m=395.4, beam_m=59.0, draft_m=16.0,
             inbound_teu=4200, outbound_teu=3900, total_moves=8100,
             eta="2026-07-24T22:00:00Z", etd="2026-07-26T16:00:00Z",
             actual_arrival="2026-07-24T23:30:00Z", actual_departure="2026-07-26T17:00:00Z",
             status=VesselStatus.DEPARTED,
             congestion_score=0.28, risk_level=RiskLevel.LOW, delay_hours=1.5,
             origin_port="Valencia", destination_port="New York",
             priority="normal", dwell_time_hours=41.5),
        dict(id="V-007", name="Maersk Mc-Kinney Moller", imo="IMO9619907", call_sign="OXHF2",
             flag="Denmark", carrier="Maersk", vessel_type=VesselType.ULCV, teu_capacity=18270,
             length_overall_m=399.0, beam_m=56.4, draft_m=14.5,
             inbound_teu=3800, outbound_teu=3600, total_moves=7400,
             eta="2026-07-29T06:00:00Z", etd="2026-07-31T14:00:00Z",
             status=VesselStatus.SCHEDULED,
             congestion_score=0.38, risk_level=RiskLevel.LOW, delay_hours=0.0,
             origin_port="Aarhus", destination_port="Port Klang",
             priority="normal", dwell_time_hours=0.0),
        dict(id="V-008", name="OOCL Hong Kong", imo="IMO9776171", call_sign="VRPH5", flag="Hong Kong",
             carrier="OOCL", vessel_type=VesselType.ULCV, teu_capacity=21413,
             length_overall_m=400.0, beam_m=58.8, draft_m=14.0,
             inbound_teu=5600, outbound_teu=5100, total_moves=10700,
             eta="2026-07-26T16:00:00Z", etd="2026-07-29T20:00:00Z",
             status=VesselStatus.ANCHORED,
             congestion_score=0.91, risk_level=RiskLevel.CRITICAL, delay_hours=9.5,
             origin_port="Hong Kong", destination_port="Los Angeles",
             priority="express", dwell_time_hours=0.0,
             recommended_action="CRITICAL: Prioritise berth allocation immediately"),
        dict(id="V-009", name="NYK Constellation", imo="IMO9741057", call_sign="7JGT9", flag="Japan",
             carrier="NYK", vessel_type=VesselType.NEO_PANAMAX, teu_capacity=13208,
             length_overall_m=364.0, beam_m=51.2, draft_m=15.0,
             inbound_teu=3200, outbound_teu=2900, total_moves=6100,
             eta="2026-07-25T20:00:00Z", etd="2026-07-27T22:00:00Z",
             actual_arrival="2026-07-25T20:30:00Z", status=VesselStatus.AT_BERTH,
             assigned_berth="B-03", assigned_cranes=["QC-06", "QC-07"],
             congestion_score=0.42, risk_level=RiskLevel.MEDIUM, delay_hours=0.5,
             origin_port="Nagoya", destination_port="Jeddah",
             priority="normal", dwell_time_hours=22.0),
        dict(id="V-010", name="Hapag Lloyd Berlin", imo="IMO9302532", call_sign="DKLT3", flag="Germany",
             carrier="Hapag-Lloyd", vessel_type=VesselType.POST_PANAMAX, teu_capacity=8749,
             length_overall_m=333.0, beam_m=42.8, draft_m=14.2,
             inbound_teu=2100, outbound_teu=1900, total_moves=4000,
             eta="2026-07-28T12:00:00Z", etd="2026-07-30T08:00:00Z",
             status=VesselStatus.SCHEDULED,
             congestion_score=0.33, risk_level=RiskLevel.LOW, delay_hours=0.0,
             origin_port="Hamburg", destination_port="Santos",
             priority="normal", dwell_time_hours=0.0),
    ]

    import random
    rng = random.Random(42)
    carriers = ["MSC", "Maersk", "COSCO", "Evergreen", "CMA CGM", "Hapag-Lloyd", "ONE", "Yang Ming"]
    flags = ["Panama", "Liberia", "Marshall Islands", "Bahamas", "Malta", "Singapore"]
    origins = ["Singapore", "Shanghai", "Busan", "Hong Kong", "Dubai", "Port Klang", "Colombo"]
    dests = ["Rotterdam", "Hamburg", "Antwerp", "Felixstowe", "Los Angeles", "New York", "Santos"]
    types = list(VesselType)
    statuses = [VesselStatus.SCHEDULED, VesselStatus.ANCHORED, VesselStatus.DELAYED]
    risks = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.LOW, RiskLevel.LOW, RiskLevel.HIGH]

    for i in range(11, 226):
        vtype = rng.choice(types)
        cap_map = {
            "ULCV (18k-24k TEU)": 20000, "Neo-Panamax (10k-14k TEU)": 12000,
            "Post-Panamax (6k-9k TEU)": 7500, "Panamax (4k-5.5k TEU)": 5000,
            "Feedermax (2k-3.5k TEU)": 3000, "Feeder (<2k TEU)": 1500,
        }
        cap = cap_map.get(vtype.value, 8000)
        inb = rng.randint(int(cap * 0.15), int(cap * 0.45))
        outb = rng.randint(int(cap * 0.12), int(cap * 0.40))
        risk = rng.choice(risks)
        delay = round(rng.uniform(0, 8), 1) if risk in (RiskLevel.HIGH, RiskLevel.CRITICAL) else round(rng.uniform(0, 1), 1)
        day = rng.randint(25, 31)
        hour = rng.randint(0, 23)
        raw.append(dict(
            id=f"V-{i:03d}",
            name=f"{rng.choice(carriers)} Vessel {i:03d}",
            imo=f"IMO{9000000 + i}",
            call_sign=f"XX{i:04d}",
            flag=rng.choice(flags),
            carrier=rng.choice(carriers),
            vessel_type=vtype,
            teu_capacity=cap,
            length_overall_m=round(rng.uniform(180, 400), 1),
            beam_m=round(rng.uniform(28, 62), 1),
            draft_m=round(rng.uniform(9, 16), 1),
            inbound_teu=inb,
            outbound_teu=outb,
            total_moves=inb + outb,
            eta=f"2026-07-{day:02d}T{hour:02d}:00:00Z",
            etd=f"2026-07-{min(day + 2, 31):02d}T{(hour + 12) % 24:02d}:00:00Z",
            status=rng.choice(statuses),
            congestion_score=round(rng.uniform(0.1, 0.95), 2),
            risk_level=risk,
            delay_hours=delay,
            origin_port=rng.choice(origins),
            destination_port=rng.choice(dests),
            priority=rng.choice(["normal", "normal", "normal", "high", "express"]),
            dwell_time_hours=0.0,
        ))
    return [Vessel(**v) for v in raw]


def _seed_berths() -> list[Berth]:
    data = [
        dict(id="B-01", name="Berth 1 - ULCV North", length_m=410.0, max_draft_m=16.5,
             max_teu_capacity=24000,
             compatible_vessel_types=["ULCV (18k-24k TEU)", "Neo-Panamax (10k-14k TEU)"],
             assigned_crane_ids=["QC-01", "QC-02", "QC-03"],
             current_vessel_id="V-001", current_vessel_name="MSC Gulsun",
             status="occupied", utilization_pct=87.5, queue_count=2),
        dict(id="B-02", name="Berth 2 - ULCV South", length_m=400.0, max_draft_m=16.0,
             max_teu_capacity=23000,
             compatible_vessel_types=["ULCV (18k-24k TEU)", "Neo-Panamax (10k-14k TEU)"],
             assigned_crane_ids=["QC-04", "QC-05"],
             current_vessel_id="V-004", current_vessel_name="CMA CGM Jacques Saade",
             status="occupied", utilization_pct=72.0, queue_count=1),
        dict(id="B-03", name="Berth 3 - Neo-Panamax A", length_m=370.0, max_draft_m=15.5,
             max_teu_capacity=14000,
             compatible_vessel_types=["Neo-Panamax (10k-14k TEU)", "Post-Panamax (6k-9k TEU)"],
             assigned_crane_ids=["QC-06", "QC-07"],
             current_vessel_id="V-009", current_vessel_name="NYK Constellation",
             status="occupied", utilization_pct=65.0, queue_count=0),
        dict(id="B-04", name="Berth 4 - Neo-Panamax B", length_m=365.0, max_draft_m=15.0,
             max_teu_capacity=13000,
             compatible_vessel_types=["Neo-Panamax (10k-14k TEU)", "Post-Panamax (6k-9k TEU)"],
             assigned_crane_ids=["QC-08", "QC-09"],
             status="available", utilization_pct=0.0, queue_count=3),
        dict(id="B-05", name="Berth 5 - Post-Panamax A", length_m=340.0, max_draft_m=14.5,
             max_teu_capacity=9000,
             compatible_vessel_types=["Post-Panamax (6k-9k TEU)", "Panamax (4k-5.5k TEU)"],
             assigned_crane_ids=["QC-10", "QC-11"],
             status="available", utilization_pct=0.0, queue_count=1),
        dict(id="B-06", name="Berth 6 - Post-Panamax B", length_m=335.0, max_draft_m=14.0,
             max_teu_capacity=8500,
             compatible_vessel_types=["Post-Panamax (6k-9k TEU)", "Panamax (4k-5.5k TEU)"],
             assigned_crane_ids=["QC-12"],
             status="maintenance", utilization_pct=0.0, queue_count=0),
        dict(id="B-07", name="Berth 7 - Panamax A", length_m=300.0, max_draft_m=13.5,
             max_teu_capacity=5500,
             compatible_vessel_types=["Panamax (4k-5.5k TEU)", "Feedermax (2k-3.5k TEU)"],
             assigned_crane_ids=["QC-13", "QC-14"],
             status="available", utilization_pct=0.0, queue_count=0),
        dict(id="B-08", name="Berth 8 - Feeder Terminal", length_m=240.0, max_draft_m=11.0,
             max_teu_capacity=3500,
             compatible_vessel_types=["Feedermax (2k-3.5k TEU)", "Feeder (<2k TEU)"],
             assigned_crane_ids=["QC-15", "QC-16"],
             status="available", utilization_pct=0.0, queue_count=2),
    ]
    return [Berth(**d) for d in data]


def _seed_cranes() -> list[QuayCrane]:
    data = [
        dict(id="QC-01", name="QC Alpha-1", berth_id="B-01", moves_per_hour=34, status="active",
             assigned_vessel_id="V-001", assigned_vessel_name="MSC Gulsun",
             hours_operated=1542.0, next_maintenance="2026-08-15", efficiency_pct=96.2, operator_gang="Gang A-1"),
        dict(id="QC-02", name="QC Alpha-2", berth_id="B-01", moves_per_hour=32, status="active",
             assigned_vessel_id="V-001", assigned_vessel_name="MSC Gulsun",
             hours_operated=1498.0, next_maintenance="2026-08-20", efficiency_pct=93.8, operator_gang="Gang A-2"),
        dict(id="QC-03", name="QC Alpha-3", berth_id="B-01", moves_per_hour=30, status="active",
             assigned_vessel_id="V-001", assigned_vessel_name="MSC Gulsun",
             hours_operated=1601.0, next_maintenance="2026-08-10", efficiency_pct=91.0, operator_gang="Gang B-1"),
        dict(id="QC-04", name="QC Beta-1", berth_id="B-02", moves_per_hour=33, status="active",
             assigned_vessel_id="V-004", assigned_vessel_name="CMA CGM Jacques Saade",
             hours_operated=1220.0, next_maintenance="2026-09-01", efficiency_pct=95.5, operator_gang="Gang B-2"),
        dict(id="QC-05", name="QC Beta-2", berth_id="B-02", moves_per_hour=31, status="active",
             assigned_vessel_id="V-004", assigned_vessel_name="CMA CGM Jacques Saade",
             hours_operated=1180.0, next_maintenance="2026-09-05", efficiency_pct=92.0, operator_gang="Gang C-1"),
        dict(id="QC-06", name="QC Gamma-1", berth_id="B-03", moves_per_hour=32, status="active",
             assigned_vessel_id="V-009", assigned_vessel_name="NYK Constellation",
             hours_operated=980.0, next_maintenance="2026-09-22", efficiency_pct=94.0, operator_gang="Gang C-2"),
        dict(id="QC-07", name="QC Gamma-2", berth_id="B-03", moves_per_hour=29, status="active",
             assigned_vessel_id="V-009", assigned_vessel_name="NYK Constellation",
             hours_operated=876.0, next_maintenance="2026-10-01", efficiency_pct=89.5, operator_gang="Gang D-1"),
        dict(id="QC-08", name="QC Delta-1", berth_id="B-04", moves_per_hour=34, status="idle",
             hours_operated=654.0, next_maintenance="2026-10-10", efficiency_pct=97.0, operator_gang="Gang D-2"),
        dict(id="QC-09", name="QC Delta-2", berth_id="B-04", moves_per_hour=33, status="idle",
             hours_operated=710.0, next_maintenance="2026-10-12", efficiency_pct=95.0, operator_gang="Gang E-1"),
        dict(id="QC-10", name="QC Epsilon-1", berth_id="B-05", moves_per_hour=30, status="idle",
             hours_operated=1350.0, next_maintenance="2026-08-25", efficiency_pct=90.5, operator_gang="Gang E-2"),
        dict(id="QC-11", name="QC Epsilon-2", berth_id="B-05", moves_per_hour=28, status="idle",
             hours_operated=1420.0, next_maintenance="2026-08-28", efficiency_pct=88.0, operator_gang="Gang F-1"),
        dict(id="QC-12", name="QC Zeta-1", berth_id="B-06", moves_per_hour=32, status="maintenance",
             hours_operated=2100.0, next_maintenance="2026-07-28", efficiency_pct=78.0, operator_gang=None),
        dict(id="QC-13", name="QC Eta-1", berth_id="B-07", moves_per_hour=31, status="idle",
             hours_operated=560.0, next_maintenance="2026-11-01", efficiency_pct=96.0, operator_gang="Gang F-2"),
        dict(id="QC-14", name="QC Eta-2", berth_id="B-07", moves_per_hour=29, status="idle",
             hours_operated=440.0, next_maintenance="2026-11-15", efficiency_pct=94.5, operator_gang="Gang G-1"),
        dict(id="QC-15", name="QC Theta-1", berth_id="B-08", moves_per_hour=26, status="idle",
             hours_operated=320.0, next_maintenance="2026-12-01", efficiency_pct=93.0, operator_gang="Gang G-2"),
        dict(id="QC-16", name="QC Theta-2", berth_id="B-08", moves_per_hour=25, status="idle",
             hours_operated=290.0, next_maintenance="2026-12-10", efficiency_pct=92.0, operator_gang="Gang H-1"),
    ]
    return [QuayCrane(**d) for d in data]


def _seed_yard_zones() -> list[YardZone]:
    data = [
        dict(id="Y-01", name="Zone Alpha - Import North", zone_type="Import",
             capacity_teu=8000, current_occupancy_teu=6720, utilization_pct=84.0,
             avg_dwell_days=4.2, risk_level="warning", assigned_rtgs=6),
        dict(id="Y-02", name="Zone Bravo - Import South", zone_type="Import",
             capacity_teu=7500, current_occupancy_teu=5100, utilization_pct=68.0,
             avg_dwell_days=3.8, risk_level="safe", assigned_rtgs=5),
        dict(id="Y-03", name="Zone Charlie - Export East", zone_type="Export",
             capacity_teu=6000, current_occupancy_teu=4560, utilization_pct=76.0,
             avg_dwell_days=2.1, risk_level="safe", assigned_rtgs=4),
        dict(id="Y-04", name="Zone Delta - Export West", zone_type="Export",
             capacity_teu=6500, current_occupancy_teu=6240, utilization_pct=96.0,
             avg_dwell_days=2.8, risk_level="critical", assigned_rtgs=5, hazmat_count=12),
        dict(id="Y-05", name="Zone Echo - Reefer Block", zone_type="Reefer",
             capacity_teu=2400, current_occupancy_teu=1920, utilization_pct=80.0,
             avg_dwell_days=5.5, risk_level="warning", assigned_rtgs=3,
             reefer_plugs_total=480, reefer_plugs_used=384),
        dict(id="Y-06", name="Zone Foxtrot - Transshipment Hub", zone_type="Transshipment",
             capacity_teu=5000, current_occupancy_teu=2800, utilization_pct=56.0,
             avg_dwell_days=1.9, risk_level="safe", assigned_rtgs=4),
        dict(id="Y-07", name="Zone Golf - Hazmat Compound", zone_type="Import",
             capacity_teu=1200, current_occupancy_teu=960, utilization_pct=80.0,
             avg_dwell_days=6.1, risk_level="warning", assigned_rtgs=2, hazmat_count=45),
        dict(id="Y-08", name="Zone Hotel - Empty Depot", zone_type="Empty",
             capacity_teu=10000, current_occupancy_teu=4200, utilization_pct=42.0,
             avg_dwell_days=8.0, risk_level="safe", assigned_rtgs=3),
        dict(id="Y-09", name="Zone India - Transshipment South", zone_type="Transshipment",
             capacity_teu=4500, current_occupancy_teu=3600, utilization_pct=80.0,
             avg_dwell_days=2.2, risk_level="warning", assigned_rtgs=3),
        dict(id="Y-10", name="Zone Juliet - Reefer Overflow", zone_type="Reefer",
             capacity_teu=1000, current_occupancy_teu=450, utilization_pct=45.0,
             avg_dwell_days=4.0, risk_level="safe", assigned_rtgs=2,
             reefer_plugs_total=200, reefer_plugs_used=90),
        dict(id="Y-11", name="Zone Kilo - Import Overflow", zone_type="Import",
             capacity_teu=3000, current_occupancy_teu=2700, utilization_pct=90.0,
             avg_dwell_days=5.0, risk_level="critical", assigned_rtgs=3),
        dict(id="Y-12", name="Zone Lima - Export Buffer", zone_type="Export",
             capacity_teu=3500, current_occupancy_teu=1050, utilization_pct=30.0,
             avg_dwell_days=1.5, risk_level="safe", assigned_rtgs=2),
    ]
    return [YardZone(**d) for d in data]


def _seed_alerts() -> list[OperationalAlert]:
    data = [
        dict(id="A-001", title="Yard Zone Delta at 96% Capacity",
             description="Zone Delta (Export West) has reached critical capacity at 96%. Inbound cargo from V-001 cannot be staged without offloading first.",
             severity=AlertSeverity.CRITICAL, category="yard_capacity",
             resource_id="Y-04", timestamp="2026-07-25T07:30:00Z",
             recommended_action="Initiate emergency rebalance: move 240 TEU from Y-04 to Y-12 (30% free).",
             is_actionable=True, is_resolved=False),
        dict(id="A-002", title="OOCL Hong Kong - 9.5h Delay (Anchored)",
             description="V-008 OOCL Hong Kong has been at anchor for 9.5 hours beyond planned arrival. Customer SLA breach imminent.",
             severity=AlertSeverity.CRITICAL, category="vessel_delay",
             resource_id="V-008", timestamp="2026-07-25T05:00:00Z",
             recommended_action="Immediately allocate B-04 (available) and pre-stage QC-08/QC-09.",
             is_actionable=True, is_resolved=False),
        dict(id="A-003", title="QC Zeta-1 Unscheduled Maintenance",
             description="QC-12 at Berth 6 has entered unscheduled maintenance. Berth 6 is now unavailable for planned arrival of V-010.",
             severity=AlertSeverity.HIGH, category="equipment",
             resource_id="QC-12", timestamp="2026-07-25T04:15:00Z",
             recommended_action="Redirect V-010 to Berth 7 (B-07). Estimated crane readiness: 18h.",
             is_actionable=True, is_resolved=False),
        dict(id="A-004", title="Congestion Score Spike - Anchorage Area",
             description="5 vessels now anchored simultaneously. Average anchorage wait time has risen to 6.2h (threshold: 4h).",
             severity=AlertSeverity.HIGH, category="congestion",
             timestamp="2026-07-25T06:00:00Z",
             recommended_action="Activate alternate quay routing and defer 2 low-priority arrivals by 12h.",
             is_actionable=True, is_resolved=False),
        dict(id="A-005", title="Reefer Plug Utilisation at 80%",
             description="Zone Echo Reefer Block has 384/480 plugs in use. Temperature-sensitive cargo from V-003 requires 96 plugs.",
             severity=AlertSeverity.MEDIUM, category="yard_capacity",
             resource_id="Y-05", timestamp="2026-07-25T08:00:00Z",
             recommended_action="Reserve plug slots in Zone Juliet (Y-10) overflow block.",
             is_actionable=True, is_resolved=False),
        dict(id="A-006", title="Hazmat Compound Near Capacity",
             description="Zone Golf hazmat compound holds 45 units - approaching 80% of regulatory limit (60 units).",
             severity=AlertSeverity.MEDIUM, category="compliance",
             resource_id="Y-07", timestamp="2026-07-25T07:00:00Z",
             recommended_action="Coordinate with customs for priority clearance of 10 oldest hazmat units.",
             is_actionable=True, is_resolved=False),
        dict(id="A-007", title="MSC Gulsun ETA Delay Resolved",
             description="V-001 MSC Gulsun 2.5h ETA delay has been absorbed. Vessel now at berth and operations underway.",
             severity=AlertSeverity.LOW, category="vessel_delay",
             resource_id="V-001", timestamp="2026-07-25T07:00:00Z",
             recommended_action="No action required. Monitor unload progress.",
             is_actionable=False, is_resolved=True),
    ]
    return [OperationalAlert(**d) for d in data]


class InMemoryRepository:
    def __init__(self) -> None:
        self._vessels: list[Vessel] = _seed_vessels()
        self._berths: list[Berth] = _seed_berths()
        self._cranes: list[QuayCrane] = _seed_cranes()
        self._yard: list[YardZone] = _seed_yard_zones()
        self._alerts: list[OperationalAlert] = _seed_alerts()

    def get_vessels(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        risk_level: Optional[str] = None,
        carrier: Optional[str] = None,
        vessel_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Vessel], int]:
        vessels = self._vessels
        if search:
            q = search.lower()
            vessels = [v for v in vessels if q in v.name.lower() or q in v.imo.lower() or q in v.carrier.lower()]
        if status:
            vessels = [v for v in vessels if v.status.value == status]
        if risk_level:
            vessels = [v for v in vessels if v.risk_level.value == risk_level]
        if carrier:
            vessels = [v for v in vessels if v.carrier.lower() == carrier.lower()]
        if vessel_type:
            vessels = [v for v in vessels if v.vessel_type.value == vessel_type]
        total = len(vessels)
        return vessels[offset: offset + limit], total

    def get_vessel(self, vessel_id: str) -> Optional[Vessel]:
        return next((v for v in self._vessels if v.id == vessel_id), None)

    def add_vessel(self, vc: VesselCreate) -> Vessel:
        new_id = f"V-{uuid.uuid4().hex[:6].upper()}"
        v = Vessel(
            id=new_id,
            total_moves=vc.inbound_teu + vc.outbound_teu,
            congestion_score=0.0,
            risk_level=RiskLevel.LOW,
            delay_hours=0.0,
            dwell_time_hours=0.0,
            **vc.model_dump(),
        )
        self._vessels.append(v)
        return v

    def update_vessel(self, vessel_id: str, updates) -> Optional[Vessel]:
        v = self.get_vessel(vessel_id)
        if not v:
            return None
        data = v.model_dump()
        for k, val in updates.model_dump(exclude_none=True).items():
            data[k] = val
        updated = Vessel(**data)
        self._vessels = [updated if x.id == vessel_id else x for x in self._vessels]
        return updated

    def get_berths(self) -> list[Berth]:
        return list(self._berths)

    def get_cranes(self) -> list[QuayCrane]:
        return list(self._cranes)

    def get_yard_zones(self) -> list[YardZone]:
        return list(self._yard)

    def rebalance_yard_zone(self, source_id: str, target_id: str, teu_to_move: int) -> dict:
        src = next((z for z in self._yard if z.id == source_id), None)
        tgt = next((z for z in self._yard if z.id == target_id), None)
        if not src or not tgt:
            return {"error": f"Zone {source_id if not src else target_id} not found."}
        if src.current_occupancy_teu < teu_to_move:
            return {"error": f"Source zone only has {src.current_occupancy_teu} TEU available."}
        if (tgt.capacity_teu - tgt.current_occupancy_teu) < teu_to_move:
            return {"error": f"Target zone only has {tgt.capacity_teu - tgt.current_occupancy_teu} TEU free."}
        src_data = src.model_dump()
        src_data["current_occupancy_teu"] -= teu_to_move
        src_data["utilization_pct"] = round(src_data["current_occupancy_teu"] / src_data["capacity_teu"] * 100, 1)
        src_data["risk_level"] = "safe" if src_data["utilization_pct"] < 75 else ("warning" if src_data["utilization_pct"] < 90 else "critical")
        tgt_data = tgt.model_dump()
        tgt_data["current_occupancy_teu"] += teu_to_move
        tgt_data["utilization_pct"] = round(tgt_data["current_occupancy_teu"] / tgt_data["capacity_teu"] * 100, 1)
        tgt_data["risk_level"] = "safe" if tgt_data["utilization_pct"] < 75 else ("warning" if tgt_data["utilization_pct"] < 90 else "critical")
        self._yard = [
            YardZone(**src_data) if z.id == source_id else
            YardZone(**tgt_data) if z.id == target_id else z
            for z in self._yard
        ]
        return {
            "status": "success",
            "teu_moved": teu_to_move,
            "source": {"id": source_id, "utilization_pct": src_data["utilization_pct"]},
            "target": {"id": target_id, "utilization_pct": tgt_data["utilization_pct"]},
        }

    def get_alerts(self, active_only: bool = False) -> list[OperationalAlert]:
        if active_only:
            return [a for a in self._alerts if not a.is_resolved]
        return list(self._alerts)

    def resolve_alert(self, alert_id: str) -> Optional[OperationalAlert]:
        a = next((x for x in self._alerts if x.id == alert_id), None)
        if not a:
            return None
        data = a.model_dump()
        data["is_resolved"] = True
        resolved = OperationalAlert(**data)
        self._alerts = [resolved if x.id == alert_id else x for x in self._alerts]
        return resolved

    def reset(self) -> None:
        self.__init__()


repo = InMemoryRepository()
