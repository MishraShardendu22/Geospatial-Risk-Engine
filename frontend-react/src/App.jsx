import { useEffect, useMemo, useState } from "react";
import InputForm from "./components/InputForm";
import MapPanel from "./components/MapPanel";
import SummaryPanel from "./components/SummaryPanel";
import RawDataPanel from "./components/RawDataPanel";
import RunActivityPanel from "./components/RunActivityPanel";
import { analyzeLand, downloadReportJson, downloadReportPdf, getTrace } from "./services/api";

const defaultFormState = {
  latitude: "",
  longitude: "",
  surveyNumber: "",
  villageId: "",
  pincode: "",
  surveyType: "parcel",
};

const analysisSteps = [
  {
    id: "validate",
    label: "Validate request payload",
    detail: "Checking coordinates, survey metadata, and request schema.",
  },
  {
    id: "kgis",
    label: "Fetch geospatial context",
    detail: "Pulling KGIS boundary, district, and jurisdictional layers.",
  },
  {
    id: "satellite",
    label: "Compute satellite features",
    detail: "Extracting NDVI and water overlap evidence from imagery assets.",
  },
  {
    id: "ml",
    label: "Run ML inference",
    detail: "Evaluating engineered features through the XGBoost model.",
  },
  {
    id: "report",
    label: "Compile final report",
    detail: "Assembling risk class, confidence, and traceable explanation.",
  },
];

function createLogEntry(message) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    message,
  };
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function saveJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  saveBlob(blob, filename);
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [trace, setTrace] = useState(null);
  const [form, setForm] = useState(defaultFormState);
  const [input, setInput] = useState(null);
  const [activity, setActivity] = useState({
    status: "idle",
    progress: 0,
    currentStep: -1,
    startedAt: null,
    finishedAt: null,
    logs: [],
  });

  const headerText = useMemo(
    () => "AI-powered geospatial risk assessment with satellite validation and traceable evidence.",
    []
  );

  useEffect(() => {
    if (activity.status !== "running") return undefined;

    const ticker = window.setInterval(() => {
      setActivity((prev) => {
        if (prev.status !== "running") return prev;

        const nextStep = Math.min(prev.currentStep + 1, analysisSteps.length - 1);
        const nextProgress = Math.min(92, prev.progress + 8);
        const stepAdvanced = nextStep !== prev.currentStep;

        const nextLogs = [...prev.logs];
        if (stepAdvanced) {
          nextLogs.push(
            createLogEntry(`Step ${nextStep + 1}/${analysisSteps.length}: ${analysisSteps[nextStep].label}.`)
          );
        } else {
          nextLogs.push(createLogEntry("Awaiting downstream service responses..."));
        }

        return {
          ...prev,
          currentStep: nextStep,
          progress: nextProgress,
          logs: nextLogs.slice(-12),
        };
      });
    }, 1400);

    return () => window.clearInterval(ticker);
  }, [activity.status]);

  const activityHeadline = useMemo(() => {
    if (activity.status === "running") return "Analysis in progress";
    if (activity.status === "success") return "Last run completed";
    if (activity.status === "error") return "Last run failed";
    return "Ready for assessment";
  }, [activity.status]);

  async function handleAnalyze(payload) {
    setLoading(true);
    setError("");
    setInput(payload);
    setReport(null);
    setTrace(null);
    setActivity({
      status: "running",
      progress: 10,
      currentStep: 0,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      logs: [
        createLogEntry("Assessment request queued."),
        createLogEntry(`Step 1/${analysisSteps.length}: ${analysisSteps[0].label}.`),
      ],
    });

    try {
      const analyzed = await analyzeLand(payload);
      const reportPayload = analyzed.report;
      setReport(reportPayload);

      let tracePayload = null;
      if (reportPayload?.id) {
        tracePayload = await getTrace(reportPayload.id);
        setTrace(tracePayload);
      }

      setActivity((prev) => ({
        ...prev,
        status: "success",
        progress: 100,
        currentStep: analysisSteps.length - 1,
        finishedAt: new Date().toISOString(),
        logs: [
          ...prev.logs,
          createLogEntry(
            reportPayload?.id
              ? `Assessment completed. Report ${reportPayload.id} generated${
                  analyzed.cacheHit ? " from cache." : "."
                }`
              : "Assessment completed."
          ),
          createLogEntry(
            tracePayload
              ? "Trace payload captured and rendered in raw data panel."
              : "Trace payload unavailable for this run."
          ),
        ].slice(-12),
      }));
    } catch (err) {
      const errorMessage = err.message || "Failed to run analysis.";
      setError(errorMessage);
      setReport(null);
      setTrace(null);
      setActivity((prev) => ({
        ...prev,
        status: "error",
        finishedAt: new Date().toISOString(),
        progress: Math.max(prev.progress, 16),
        logs: [...prev.logs, createLogEntry(`Assessment failed: ${errorMessage}`)].slice(-12),
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMapLocationPick(location) {
    if (!location) return;
    setForm((prev) => ({
      ...prev,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    }));
  }

  function handleFormReset() {
    setForm(defaultFormState);
    setInput(null);
  }

  const mapInput = {
    latitude: form.latitude !== "" ? form.latitude : input?.latitude,
    longitude: form.longitude !== "" ? form.longitude : input?.longitude,
  };

  async function handleExportJson() {
    if (!report?.id) return;
    setExporting(true);
    setError("");
    try {
      const data = await downloadReportJson(report.id);
      saveJsonFile(data, `land-risk-report-${report.id}.json`);
    } catch (err) {
      setError(err.message || "JSON export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    if (!report?.id) return;
    setExporting(true);
    setError("");
    try {
      const blob = await downloadReportPdf(report.id);
      saveBlob(blob, `land-risk-report-${report.id}.pdf`);
    } catch (err) {
      setError(err.message || "PDF export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Land Risk Intelligence System</p>
        <h1>Assessment Console</h1>
        <p>{headerText}</p>
        <div className="hero-status-row">
          <span className={`status-chip status-${activity.status}`}>{activityHeadline}</span>
          <span className="hero-hint">Tip: pick a point on the map to auto-fill coordinates.</span>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="layout-main">
        <InputForm
          onSubmit={handleAnalyze}
          loading={loading}
          form={form}
          onFormChange={handleFormChange}
          onReset={handleFormReset}
        />
        <SummaryPanel
          report={report}
          onExportJson={handleExportJson}
          onExportPdf={handleExportPdf}
          exporting={exporting}
          loading={loading}
          activity={activity}
        />
      </section>

      <section className="layout-activity">
        <RunActivityPanel activity={activity} steps={analysisSteps} />
      </section>

      <section className="layout-secondary">
        <MapPanel
          report={report}
          input={mapInput}
          onPickLocation={handleMapLocationPick}
        />
        <RawDataPanel trace={trace} loading={loading} activity={activity} />
      </section>
    </div>
  );
}
