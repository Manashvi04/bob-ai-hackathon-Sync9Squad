# PortFlowAI — Container Congestion Predictor & Port Operations Optimiser

## Team

**Team Name:** Sync9Squad  
**Track:** AI  
**Team Lead:** Princee Bhingradiya 
**Members:** Manashvi Choksi , Rudra joshi , Krish Sabhaya   

---

## Problem Statement

Major ports handle large numbers of vessel arrivals while operating with limited berth slots, cranes, yard capacity, and shift resources.

In many cases, berth and crane allocation is still managed using spreadsheets and manual coordination. Congestion is often detected only after vessels have already started queueing.

This reactive approach can create:

- Vessel delays
- Berth conflicts
- Crane resource conflicts
- Yard congestion
- Longer turnaround time
- Higher operational costs
- Supply-chain disruption

The challenge is to predict congestion before it becomes critical and help port supervisors make better operational decisions.

---

## Our Solution

**PortFlowAI** is an AI-assisted port operations decision-support platform.

The system uses vessel schedule data together with berth capacity, crane availability, container workload, and yard utilisation to predict upcoming congestion risks.

After identifying high-risk areas, the system recommends actions such as:

- Better berth assignments
- Crane redistribution
- Vessel rescheduling
- Alternate routing
- Yard utilisation balancing
- Operational alerts

It also generates a structured **72-hour port operations plan** for shift supervisors.

The goal is to move port planning from a reactive process to a proactive one.

---

## Key Features

### Congestion Prediction
Predicts upcoming congestion using vessel ETA/ETD, berth availability, container volume, crane capacity, and yard utilisation.

### Berth Optimisation
Recommends suitable berth assignments based on vessel requirements, time windows, and capacity.

### Crane Optimisation
Allocates available cranes to vessels based on workload and operational demand.

### Yard Capacity Monitoring
Tracks yard utilisation and identifies zones approaching critical capacity.

### Alternate Routing Recommendations
Suggests alternate routing or rescheduling when congestion risk becomes high.

### Operational Alerts
Generates alerts for berth conflicts, congestion hotspots, yard pressure, and resource shortages.

### 72-Hour Operations Plan
Creates a structured operations plan for the next 72 hours covering:

- Vessel handling
- Berth allocation
- Crane assignment
- Yard pressure
- Congestion risk
- Recommended actions

### Operations Dashboard
Provides a visual command center showing:

- Vessel queue
- Congestion risk
- Berth utilisation
- Crane utilisation
- Yard utilisation
- Alerts
- Recommendations
- 72-hour plan

---

## User Journey

1. Port supervisor opens the dashboard.
2. Upcoming vessel schedules are loaded.
3. Port capacity information is analysed.
4. Congestion risks are calculated.
5. High-risk vessels and berths are highlighted.
6. Berth and crane optimisation recommendations are generated.
7. Alternate routing or rescheduling suggestions are shown.
8. A 72-hour operations plan is generated.
9. Shift supervisors use the recommendations for operational planning.

---

## Tech Stack

- Frontend: React + Vite
- Backend: Python + FastAPI
- Data Processing: Pandas + NumPy
- Machine Learning: Scikit-learn
- Optimisation: Google OR-Tools
- Charts: Recharts
- Version Control: GitHub
- Validation: GitHub Actions
- IBM Integration: IBM Bob / IBM AI integration as implemented in the final solution

---

## Repository Structure

```text
.
├── submission.yaml
├── README.md
├── src/
│   ├── README.md
│   ├── .env.example
│   ├── frontend/
│   └── backend/
├── docs/
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/
│   ├── demo-video-link.txt
│   ├── live-demo-url.txt
│   └── screenshots/
└── presentation/