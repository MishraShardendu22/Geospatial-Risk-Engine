# Criterion 3: Accuracy and Result Validation

## Objective
Evaluate prediction quality, confidence calibration, cross-source agreement, and deterministic safety overrides.

## Validation Strategy
1. Multi-signal prediction
- Model score is generated from engineered geospatial and satellite features.
- Validation layer compares water-risk agreement between KGIS-derived and satellite-derived evidence.

2. Confidence assignment
- Confidence is raised when cross-source agreement is present.
- Confidence remains conservative when source signals conflict.

3. Deterministic safety override
- High water-overlap condition forces high-risk classification.
- Override reason is stored in validation summary for auditability.

4. Explanation generation
- Human-readable explanation lines summarize:
  - predicted class and probability
  - key satellite metrics
  - water and distance indicators
  - cross-source agreement

## Result Auditability
- Validation summary contains:
  - crossSourceAgreement
  - confidenceRule
  - ruleOverrides
  - notes
- Full traces and metrics are stored separately from summary to preserve analytical provenance.

## Test and Verification Coverage
- Unit tests exist for:
  - preprocessing behavior
  - validation logic
  - handler-level APIs
  - ML-service inference behavior and NDVI computations

## Key Implementation Anchors
- Validation rules: backend-go/internal/validation/validator.go
- Feature assembly and anomaly score logic: backend-go/internal/service/analyzer.go
- Summary rendering and explanation UI: frontend-react/src/components/SummaryPanel.jsx

## Evidence to Include in Final Report
- Screenshot placeholder: [Add Screenshot E] Risk summary with badges, confidence, and explanation.
- Table placeholder: [Add Table C] Sample validation outcomes with agreement and overrides.
- Figure placeholder: [Add Figure A] Confusion or calibration plot from offline validation dataset.

## Scoring Checklist
- Confidence logic is transparent and explainable.
- Safety overrides are deterministic and logged.
- Explanation text references measurable attributes.
- Validation outputs are persistently available for audit.
- Test suite covers rule and preprocessing edge cases.

## Risks and Improvement Opportunities
- Confidence currently uses rule-driven thresholds; calibration can be improved with historical labels.
- Add offline benchmarking workflow with precision/recall/F1 and calibration curves.
- Add regression guard tests for known risk-boundary examples.
