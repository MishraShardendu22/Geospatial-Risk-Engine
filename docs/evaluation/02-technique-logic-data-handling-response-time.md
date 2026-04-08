# Criterion 2: Technique, Logic, Data Handling, and Response Time

## Objective
Assess algorithmic design quality, service orchestration, resilience strategy, and runtime performance behavior.

## Technique and Logic
1. Multi-stage analytical pipeline
- Geospatial data pull
- Payload preprocessing
- Satellite feature extraction
- ML prediction
- Rule-based validation and risk override
- Report and trace persistence

2. Hybrid decision strategy
- ML model prediction is combined with deterministic rules.
- Rule engine can force high risk for high water overlap.
- Confidence is adjusted based on cross-source agreement.

3. Data handling model
- Structured feature vector is generated from normalized geospatial and satellite inputs.
- Intermediate outputs are captured into trace payloads.
- Final report and trace are persisted independently.

## Response Time and Reliability Controls
1. Timeout boundaries
- Request timeout wraps end-to-end analysis execution.
- Downstream service calls run under bounded contexts.

2. Caching and duplicate suppression
- Final report-level cache reduces repeat computation.
- Singleflight prevents duplicate concurrent computation for the same request hash.

3. Retry and fallback posture
- Upstream API interactions include retry behavior.
- Failures are surfaced with actionable error context.

4. Performance instrumentation
- Step-level latency is recorded.
- API-level latency maps are persisted.
- Total response and ML latency metrics are stored for trend analysis.

## Frontend Feedback Enhancements Added
- Live activity panel now shows:
  - progress bar
  - current and completed processing steps
  - rolling log feed during execution
- Loading placeholders and status chips reduce user uncertainty while background tasks run.

## Key Implementation Anchors
- Pipeline orchestration and metrics: backend-go/internal/service/analyzer.go
- Validation logic: backend-go/internal/validation/validator.go
- Activity and progress UI: frontend-react/src/components/RunActivityPanel.jsx
- App orchestration and loading state: frontend-react/src/App.jsx

## Evidence to Include in Final Report
- Screenshot placeholder: [Add Screenshot C] Activity panel while run is in progress.
- Screenshot placeholder: [Add Screenshot D] Completed activity panel with finished status.
- Table placeholder: [Add Table B] Measured response times by stage and endpoint.

## Scoring Checklist
- Pipeline stages are clearly separated and traceable.
- Latency is measurable by step and endpoint.
- Duplicate requests are deduplicated during concurrent load.
- Caching is correctly used for repeated inputs.
- Frontend communicates progress throughout long-running operations.

## Risks and Improvement Opportunities
- Current frontend progress is timeline-based, not server-streamed.
- Add server-sent events or websocket updates for exact backend stage synchronization.
- Add percentile latency dashboards (p50, p95, p99) for production-readiness reporting.
