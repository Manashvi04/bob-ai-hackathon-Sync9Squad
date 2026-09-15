from datetime import datetime
from app.models.plan import ShiftTask, ShiftPlan, Plan72HourResponse


class OperationsPlanner:
    def generate_72h_plan(self) -> Plan72HourResponse:
        supervisors = [
            "Alex Singh (Lead Ops)", "Elena Rostova (Quayside)", "Marcus Vance (Yard & Rail)",
            "David Chen (Ops Lead)", "Amina Al-Mansoor (Quayside)", "Liam O'Connor (Gate & Yard)",
            "Alex Singh (Lead Ops)", "Sarah Jenkins (Quayside)", "Carlos Ramirez (Yard & Rail)"
        ]

        shifts_data = [
            # Day 1
            ("D1-SA", "Day 1 · Mon 15 Sep", "Shift A (06:00 – 14:00)", supervisors[0], 4850, "normal", 74.0, 68.0, [
                ShiftTask(id="T101", time_window="06:30 - 07:15", vessel_name="MV Pacific Dawn", berth_id="A1", action_type="Berthing", crane_gangs=["Gang A-1", "Gang A-2"], target_moves=320, status="completed"),
                ShiftTask(id="T102", time_window="07:30 - 13:45", vessel_name="MV Pacific Dawn", berth_id="A1", action_type="Discharge", crane_gangs=["QC-01", "QC-02"], target_moves=1600, status="in_progress"),
                ShiftTask(id="T103", time_window="08:00 - 12:30", vessel_name="Ever Apex", berth_id="A2", action_type="Loading", crane_gangs=["QC-03", "QC-04"], target_moves=1400, status="in_progress"),
                ShiftTask(id="T104", time_window="11:00 - 13:30", vessel_name="Ocean Meridian", berth_id="C2", action_type="Discharge", crane_gangs=["QC-11"], target_moves=450, status="scheduled"),
            ], [
                "Verify tugboat readiness for 06:30 pilot boarding at South Channel",
                "Inspect QC-01 spreader twistlock sensor before heavy twin-lift cycle",
                "Ensure Yard Zone Y-02 has 400 empty export slots cleared for Ever Apex"
            ]),
            ("D1-SB", "Day 1 · Mon 15 Sep", "Shift B (14:00 – 22:00)", supervisors[1], 5920, "elevated", 88.0, 84.0, [
                ShiftTask(id="T105", time_window="14:15 - 15:00", vessel_name="MSC Orion", berth_id="B1", action_type="Berthing", crane_gangs=["Gang B-1", "Gang B-2"], target_moves=280, status="scheduled"),
                ShiftTask(id="T106", time_window="15:30 - 21:30", vessel_name="MSC Orion", berth_id="B1", action_type="Discharge", crane_gangs=["QC-05", "QC-06"], target_moves=1800, status="scheduled"),
                ShiftTask(id="T107", time_window="17:00 - 20:00", vessel_name="Nordic Star", berth_id="B3", action_type="Discharge", crane_gangs=["QC-08", "QC-09"], target_moves=1200, status="scheduled"),
                ShiftTask(id="T108", time_window="20:30 - 21:45", vessel_name="Ocean Meridian", berth_id="C2", action_type="Unberthing", crane_gangs=["Gang C-1"], target_moves=0, status="scheduled"),
            ], [
                "PEAK CONGESTION WINDOW: Maintain strict crane cycle time < 90 seconds",
                "Rebalance 240 TEU from high-pressure Yard Y-04 to buffer Yard Y-12",
                "Coordinate with Harbour Master for Berth B3 tidal depth clearance"
            ]),
            ("D1-SC", "Day 1 · Mon 15 Sep", "Shift C (22:00 – 06:00)", supervisors[2], 4100, "normal", 72.0, 55.0, [
                ShiftTask(id="T109", time_window="22:30 - 04:30", vessel_name="MV Pacific Dawn", berth_id="A1", action_type="Loading", crane_gangs=["QC-01", "QC-02"], target_moves=1550, status="scheduled"),
                ShiftTask(id="T110", time_window="23:00 - 05:00", vessel_name="MSC Orion", berth_id="B1", action_type="Loading", crane_gangs=["QC-05", "QC-06"], target_moves=1250, status="scheduled"),
                ShiftTask(id="T111", time_window="01:00 - 05:30", vessel_name="Baltic Trader", berth_id="C1", action_type="Discharge", crane_gangs=["QC-10"], target_moves=800, status="scheduled"),
            ], [
                "Execute overnight rail intermodal loading block on Tracks 3 and 4",
                "Quay crane maintenance check on QC-07 electrical drives during low tide",
                "Clear empty container stacks in Yard Zone Y-18 for morning arrivals"
            ]),

            # Day 2
            ("D2-SA", "Day 2 · Tue 16 Sep", "Shift A (06:00 – 14:00)", supervisors[3], 5400, "elevated", 82.0, 78.0, [
                ShiftTask(id="T201", time_window="06:00 - 07:15", vessel_name="MV Pacific Dawn", berth_id="A1", action_type="Unberthing", crane_gangs=["Gang A-1"], target_moves=0, status="scheduled"),
                ShiftTask(id="T202", time_window="07:45 - 08:30", vessel_name="Cosco Shipping Universe", berth_id="A1", action_type="Berthing", crane_gangs=["Gang A-1", "Gang A-2"], target_moves=400, status="scheduled"),
                ShiftTask(id="T203", time_window="09:00 - 13:45", vessel_name="Cosco Shipping Universe", berth_id="A1", action_type="Discharge", crane_gangs=["QC-01", "QC-02", "QC-03"], target_moves=2100, status="scheduled"),
                ShiftTask(id="T204", time_window="08:30 - 12:30", vessel_name="Madrid Express", berth_id="B2", action_type="Discharge", crane_gangs=["QC-07", "QC-08"], target_moves=1100, status="scheduled"),
            ], [
                "Pilot assigned for 21,000 TEU Cosco Shipping Universe arrival",
                "Enforce dual-cycling on Berth A1 quay cranes to maximize move rate",
                "Monitor reefer plug usage across Block Y-13 (current 87% limit)"
            ]),
            ("D2-SB", "Day 2 · Tue 16 Sep", "Shift B (14:00 – 22:00)", supervisors[4], 6250, "critical", 94.0, 89.0, [
                ShiftTask(id="T205", time_window="14:00 - 21:30", vessel_name="Cosco Shipping Universe", berth_id="A1", action_type="Loading", crane_gangs=["QC-01", "QC-02", "QC-03"], target_moves=2200, status="scheduled"),
                ShiftTask(id="T206", time_window="15:00 - 21:00", vessel_name="CMA CGM Palais Royal", berth_id="B3", action_type="Discharge", crane_gangs=["QC-08", "QC-09"], target_moves=1950, status="scheduled"),
                ShiftTask(id="T207", time_window="16:30 - 20:30", vessel_name="ONE Apus", berth_id="B1", action_type="Discharge", crane_gangs=["QC-05", "QC-06"], target_moves=1400, status="scheduled"),
            ], [
                "CRITICAL PRESSURE: Deploy auxiliary reachstackers to support quayside drayage",
                "Ensure pre-advised hazardous cargo staging in segregated Zone Y-09",
                "Implement express gate intake bypass for time-sensitive reefer export boxes"
            ]),
            ("D2-SC", "Day 2 · Tue 16 Sep", "Shift C (22:00 – 06:00)", supervisors[5], 4400, "normal", 68.0, 52.0, [
                ShiftTask(id="T208", time_window="22:30 - 05:00", vessel_name="CMA CGM Palais Royal", berth_id="B3", action_type="Loading", crane_gangs=["QC-08", "QC-09"], target_moves=1600, status="scheduled"),
                ShiftTask(id="T209", time_window="23:00 - 04:30", vessel_name="ONE Apus", berth_id="B1", action_type="Loading", crane_gangs=["QC-05", "QC-06"], target_moves=1350, status="scheduled"),
                ShiftTask(id="T210", time_window="01:30 - 05:30", vessel_name="Regional Feeder 4", berth_id="C3", action_type="Discharge", crane_gangs=["QC-12"], target_moves=450, status="scheduled"),
            ], [
                "Overnight housekeeping: restack export blocks for Day 3 morning load sequence",
                "Lubrication servicing on Berth A2 gantry rails",
                "Finalize customs manifest release for intermodal train 402B"
            ]),

            # Day 3
            ("D3-SA", "Day 3 · Wed 17 Sep", "Shift A (06:00 – 14:00)", supervisors[6], 5100, "normal", 76.0, 71.0, [
                ShiftTask(id="T301", time_window="06:30 - 07:15", vessel_name="CMA CGM Palais Royal", berth_id="B3", action_type="Unberthing", crane_gangs=["Gang B-1"], target_moves=0, status="scheduled"),
                ShiftTask(id="T302", time_window="07:45 - 08:30", vessel_name="HMM Algeciras", berth_id="A2", action_type="Berthing", crane_gangs=["Gang A-2", "Gang B-1"], target_moves=420, status="scheduled"),
                ShiftTask(id="T303", time_window="09:00 - 13:45", vessel_name="HMM Algeciras", berth_id="A2", action_type="Discharge", crane_gangs=["QC-03", "QC-04", "QC-05"], target_moves=2250, status="scheduled"),
                ShiftTask(id="T304", time_window="08:15 - 12:45", vessel_name="ZIM Sammy Ofer", berth_id="B2", action_type="Discharge", crane_gangs=["QC-07"], target_moves=850, status="scheduled"),
            ], [
                "Coordinate deep-draft escort tugs for HMM Algeciras 24,000 TEU arrival",
                "Verify shore power (Cold Ironing) connection compatibility at Berth A2",
                "Audit terminal gate turnaround time (< 26 minutes target)"
            ]),
            ("D3-SB", "Day 3 · Wed 17 Sep", "Shift B (14:00 – 22:00)", supervisors[7], 5600, "elevated", 84.0, 80.0, [
                ShiftTask(id="T305", time_window="14:15 - 21:00", vessel_name="HMM Algeciras", berth_id="A2", action_type="Loading", crane_gangs=["QC-03", "QC-04", "QC-05"], target_moves=2300, status="scheduled"),
                ShiftTask(id="T306", time_window="15:00 - 20:30", vessel_name="ZIM Sammy Ofer", berth_id="B2", action_type="Loading", crane_gangs=["QC-07"], target_moves=920, status="scheduled"),
                ShiftTask(id="T307", time_window="16:00 - 21:30", vessel_name="Pacific Leader", berth_id="C1", action_type="Discharge", crane_gangs=["QC-10"], target_moves=780, status="scheduled"),
            ], [
                "Monitor outbound vessel departure tides for 16.5m draft window",
                "Balance internal tractor movements between Berth A2 and Yard Blocks Y-06/Y-07",
                "Prepare transition brief for night relief supervisor"
            ]),
            ("D3-SC", "Day 3 · Wed 17 Sep", "Shift C (22:00 – 06:00)", supervisors[8], 3950, "normal", 64.0, 48.0, [
                ShiftTask(id="T308", time_window="22:30 - 04:00", vessel_name="HMM Algeciras", berth_id="A2", action_type="Lashing & Inspection", crane_gangs=["Gang A-2"], target_moves=150, status="scheduled"),
                ShiftTask(id="T309", time_window="23:15 - 05:00", vessel_name="Pacific Leader", berth_id="C1", action_type="Loading", crane_gangs=["QC-10"], target_moves=680, status="scheduled"),
                ShiftTask(id="T310", time_window="04:30 - 05:30", vessel_name="HMM Algeciras", berth_id="A2", action_type="Unberthing", crane_gangs=["Gang A-2"], target_moves=0, status="scheduled"),
            ], [
                "Conduct comprehensive berth bollard and fender safety inspection",
                "Complete weekly IT sync with Terminal Operating System (TOS)",
                "Review 72h actual vs plan KPI metrics report"
            ])
        ]

        shifts: list[ShiftPlan] = []
        total_moves = 0
        high_risk_shifts = 0

        for sid, day_l, shift_l, sup, moves, risk, b_occ, y_cap, tasks, checklist in shifts_data:
            shifts.append(ShiftPlan(
                shift_id=sid,
                day_label=day_l,
                shift_label=shift_l,
                supervisor=sup,
                expected_moves_teu=moves,
                risk_level=risk,
                berth_occupancy_pct=b_occ,
                yard_gate_capacity_pct=y_cap,
                tasks=tasks,
                critical_checklist=checklist
            ))
            total_moves += moves
            if risk in ["elevated", "critical"]:
                high_risk_shifts += 1

        return Plan72HourResponse(
            generated_at=datetime(2026, 9, 15, 14, 0, 0).isoformat(),
            terminal_name="North Harbor Terminal 1",
            shifts=shifts,
            total_planned_moves=total_moves,
            high_risk_shifts_count=high_risk_shifts,
            summary=f"72-hour operational shift plan active across 9 shifts. Total projected container throughput: {total_moves:,} TEU. {high_risk_shifts} shifts require heightened supervisory intervention."
        )


operations_planner = OperationsPlanner()
