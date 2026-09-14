# PortOps backend

The FastAPI service provides the API boundary for future prediction, optimisation,
and 72-hour planning modules. Those modules are intentionally placeholders in this
foundation step.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` for the API documentation or request
`http://localhost:8000/health` for a readiness check.
