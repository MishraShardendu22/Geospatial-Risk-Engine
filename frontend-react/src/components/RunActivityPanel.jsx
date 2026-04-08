function formatClock(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStepState(index, activityStatus, currentStep, totalSteps) {
  if (activityStatus === "success") return "done";

  if (activityStatus === "running") {
    if (index < currentStep) return "done";
    if (index === currentStep) return "active";
    return "pending";
  }

  if (activityStatus === "error") {
    if (index < currentStep) return "done";
    if (index === Math.min(currentStep, totalSteps - 1)) return "error";
    return "pending";
  }

  return "pending";
}

const statusLabels = {
  idle: "Idle",
  running: "Running",
  success: "Completed",
  error: "Attention Needed",
};

export default function RunActivityPanel({ activity, steps }) {
  const totalSteps = steps.length;
  const safeProgress = Math.max(0, Math.min(100, Number(activity?.progress || 0)));
  const currentStep = activity?.currentStep ?? -1;
  const logs = Array.isArray(activity?.logs) ? [...activity.logs].reverse() : [];

  return (
    <div className="card activity-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Execution</p>
          <h2>Assessment Activity</h2>
        </div>
        <span className={`status-chip status-${activity?.status || "idle"}`}>
          {statusLabels[activity?.status] || statusLabels.idle}
        </span>
      </div>

      <div className="progress-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${safeProgress}%` }} />
        </div>
        <p className="progress-meta muted">
          {Math.round(safeProgress)}% complete
          {activity?.startedAt ? ` | Started at ${formatClock(activity.startedAt)}` : ""}
          {activity?.finishedAt ? ` | Finished at ${formatClock(activity.finishedAt)}` : ""}
        </p>
      </div>

      <ol className="step-list">
        {steps.map((step, index) => {
          const state = getStepState(index, activity?.status, currentStep, totalSteps);
          return (
            <li key={step.id} className={`step-item step-${state}`}>
              <span className="step-dot" aria-hidden="true" />
              <div>
                <p className="step-title">{step.label}</p>
                <p className="step-detail">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="activity-log">
        <h3>Live Logs</h3>
        <ul>
          {logs.length > 0 ? (
            logs.slice(0, 7).map((entry) => (
              <li key={entry.id}>
                <span className="log-time">{formatClock(entry.at)}</span>
                <p>{entry.message}</p>
              </li>
            ))
          ) : (
            <li className="log-empty">No activity yet. Run an assessment to view live execution events.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
