# Criterion 1: Data Pulling and Preprocessing

## Objective
Evaluate how reliably the system ingests user input, fetches upstream geospatial data, and transforms raw payloads into model-ready features.

## Implemented Flow
1. Frontend request capture
- Input originates from manual form fields or map click selection.
- Coordinates are normalized as numeric values before submission.
- The UI enforces latitude and longitude bounds.

2. Request acceptance and guardrails
- Backend endpoint accepts payload through POST /analyze.
- Request validation requires either:
  - latitude and longitude, or
  - surveyNumber and villageId.
- Out-of-range coordinates are rejected early.

3. Geospatial data pull
- KGIS-backed data fetch executes through the backend geospatial client layer.
- API call traces are captured per endpoint with status, latency, and success markers.
- Caching and duplicate-request suppression reduce repeated upstream pulls.

4. Preprocessing and normalization
- Raw KGIS payloads are normalized into:
  - adminHierarchy
  - surveyDetails
  - geometry
  - jurisdiction
  - zonation
- Geometry is converted from WKT to GeoJSON and normalized for polygon consistency.
- Duplicate points and duplicate list entries are removed.
- Missing or malformed fields are sanitized through defensive map and slice cleaning.

5. Feature preparation
- Derived signals include distance to water, survey area, nearby asset density, forest proximity, zonation encoding, and jurisdiction flags.
- A consolidated evidence block is produced for traceability.

## Key Implementation Anchors
- Frontend capture and payload shaping: frontend-react/src/components/InputForm.jsx
- Map-based coordinate input: frontend-react/src/components/MapPanel.jsx
- Backend validation and orchestration: backend-go/internal/service/analyzer.go
- Preprocessing and geometry normalization: backend-go/internal/preprocess/preprocess.go

## Evidence to Include in Final Report
- Screenshot placeholder: [Add Screenshot A] Input form with map-selected coordinates.
- Screenshot placeholder: [Add Screenshot B] Raw trace showing KGIS endpoint calls and statuses.
- Table placeholder: [Add Table A] Input-to-feature transformation mapping.

## Scoring Checklist
- Input validation rejects invalid or incomplete payloads.
- Upstream calls are observable (status and latency captured).
- Geometry and tabular payloads are normalized into consistent structures.
- Feature extraction is deterministic and reproducible for identical inputs.
- Trace artifacts are persisted for audit.

## Risks and Improvement Opportunities
- Upstream schema drift can still impact inferencing if field names change unexpectedly.
- Add schema contracts for each critical KGIS payload branch.
- Add structured data quality counters (missing fields, fallback usage, normalization repairs).
