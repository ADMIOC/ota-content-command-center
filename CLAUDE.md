# DealFlow.Coach Frontend Integration Rule

## Backend Authority

The DealFlow.Coach frontend is subordinate to the institutional-grade backend.
Never limit, weaken, simplify, or reshape backend functionality to accommodate
frontend constraints.

When the frontend and backend do not line up, the frontend must be changed to
match the backend's real API contract, scoring model, evidence model, audit
requirements, and institutional review logic. The backend is the source of truth
for DealFlow.Coach behavior.

Frontend work must not:

- Replace backend scoring with local placeholder logic.
- Infer fields the backend explicitly treats as source-derived only.
- Bypass backend gates, caps, hard stops, audit events, or review requirements.
- Convert a backend clearance, gap, or gate state into a pass/fail shortcut.
- Ask the backend to reduce institutional rigor for UI convenience.

If a UI feature cannot represent backend behavior cleanly, the correct fix is to
redesign the UI or add an appropriate frontend adapter layer. Do not change the
backend contract to fit the current screen.
