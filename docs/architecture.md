# Architecture

## System Architecture

PortFlowAI follows a modular full-stack architecture where operational port data is processed by a FastAPI backend, analysed by congestion prediction and optimisation services, and presented through a React-based operations dashboard.

The system is designed around a simple workflow:

**Operational Data → Prediction → Optimisation → Recommendations → 72-Hour Plan → Dashboard**

```mermaid
graph TD

    A[Port Operations User / Shift Supervisor] -->|HTTP| B[Frontend - React + Vite]

    B -->|REST API| C[Backend - FastAPI]

    D[Vessel Schedules] --> C
    E[Berth Capacity & Availability] --> C
    F[Crane Capacity & Availability] --> C
    G[Yard Utilisation & Container Load] --> C

    C --> H[Data Processing & Feature Engineering]

    H --> I[Congestion Prediction Engine]

    H --> J[Berth Optimisation Engine]

    H --> K[Crane Optimisation Engine]

    I --> L[Congestion Risk & Hotspots]

    L --> M[Routing / Rescheduling Recommendation Engine]

    J --> N[72-Hour Operations Planner]

    K --> N

    M --> N

    L --> C
    J --> C
    K --> C
    M --> C
    N --> C

    C -->|JSON Response| B

    O[IBM Bob Integration] -->|Operational Query / AI Assistance| C

    C -->|Port Operations Context| O