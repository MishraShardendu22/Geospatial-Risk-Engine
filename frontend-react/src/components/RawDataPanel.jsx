export default function RawDataPanel({ trace, loading, activity }) {
  const placeholder = loading
    ? "Trace capture in progress... live execution details will be populated on completion."
    : "No trace loaded yet.";

  return (
    <div className="card raw-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Diagnostics</p>
          <h2>Trace + Raw API Data</h2>
        </div>
        <span className={`status-chip status-${activity?.status || "idle"}`}>
          {loading ? "Streaming" : "Trace"}
        </span>
      </div>
      <p className="raw-hint muted">Inspect underlying API calls, durations, and errors for auditability.</p>
      <pre aria-busy={loading}>{trace ? JSON.stringify(trace, null, 2) : placeholder}</pre>
    </div>
  );
}
