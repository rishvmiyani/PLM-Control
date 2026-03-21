import { useState } from "react";

// ---- Types ----
type ECOType = "Bill of Materials" | "Product";
type StatusType = "approved" | "in_progress" | "cancelled";
type ChangeColor = "green" | "red" | "black";

interface ComponentChange {
  name: string;
  v2: string;
  v1: string;
  color: ChangeColor;
}

interface OperationChange {
  name: string;
  v2: string;
  v1: string;
  color: ChangeColor;
}

interface ProductChange {
  field: string;
  v2: string;
  v1: string;
  color: ChangeColor;
}

// ---- Styles ----
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #8b3b9e;
    --primary-mid: #be71d1;
    --primary-light: #e6c6ed;
    --primary-ultra-light: #f8f0fb;
    --white: #ffffff;
    --text-dark: #1a1a2e;
    --text-mid: #4a4a6a;
    --text-muted: #8888aa;
    --success: #22c55e;
    --danger: #ef4444;
    --border: rgba(139,59,158,0.15);
    --glass-bg: rgba(255,255,255,0.65);
    --glass-border: rgba(190,113,209,0.25);
    --shadow: 0 8px 32px rgba(139,59,158,0.10);
    --shadow-lg: 0 20px 60px rgba(139,59,158,0.15);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--primary-ultra-light); color: var(--text-dark); min-height: 100vh; }

  .eco-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f0fb 0%, #ede0f5 40%, #fdf6ff 100%);
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient blobs */
  .eco-root::before, .eco-root::after {
    content: '';
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .eco-root::before {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(190,113,209,0.18) 0%, transparent 70%);
    top: -100px; left: -100px;
  }
  .eco-root::after {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(139,59,158,0.12) 0%, transparent 70%);
    bottom: -80px; right: -80px;
  }

  /* ---- Topbar ---- */
  .topbar {
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(255,255,255,0.80);
    border-bottom: 1px solid var(--glass-border);
    box-shadow: 0 2px 16px rgba(139,59,158,0.07);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 62px;
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-logo {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), var(--primary-mid));
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 15px;
    box-shadow: 0 2px 10px rgba(139,59,158,0.30);
    letter-spacing: -0.5px;
  }
  .topbar-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--text-muted); }
  .topbar-breadcrumb span.active { color: var(--primary); font-weight: 600; }
  .topbar-breadcrumb .sep { color: var(--primary-mid); opacity: 0.5; }
  .topbar-title { font-size: 16px; font-weight: 700; color: var(--primary); letter-spacing: -0.3px; }

  /* ---- Page layout ---- */
  .page-wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }

  /* ---- Glass card ---- */
  .glass-card {
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    background: var(--glass-bg);
    border: 1.5px solid var(--glass-border);
    border-radius: 22px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* ---- Section Header ---- */
  .section-header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  }
  .section-title { font-size: 17px; font-weight: 700; color: var(--primary); letter-spacing: -0.3px; }
  .section-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; font-style: italic; }

  /* ---- Status pill ---- */
  .status-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px; border-radius: 99px;
    font-size: 12.5px; font-weight: 600; letter-spacing: 0.3px;
    cursor: pointer; transition: all 0.2s;
    border: 1.5px solid transparent;
    user-select: none;
  }
  .status-pill .dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .status-pill.approved   { background: rgba(34,197,94,0.10); color: #15803d; border-color: rgba(34,197,94,0.30); }
  .status-pill.approved   .dot { background: #22c55e; box-shadow: 0 0 6px #22c55e88; }
  .status-pill.in_progress { background: rgba(255,255,255,0.7); color: var(--text-mid); border-color: var(--border); }
  .status-pill.in_progress .dot { background: white; border: 2px solid #aaa; }
  .status-pill.cancelled  { background: rgba(239,68,68,0.09); color: #b91c1c; border-color: rgba(239,68,68,0.25); }
  .status-pill.cancelled  .dot { background: #ef4444; box-shadow: 0 0 6px #ef444488; }

  /* ---- Form body ---- */
  .form-body { padding: 24px 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px 32px; }
  @media (max-width: 640px) { .form-body { grid-template-columns: 1fr; } }

  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.full-width { grid-column: 1 / -1; }

  .field-label {
    font-size: 12px; font-weight: 600; color: var(--primary);
    text-transform: uppercase; letter-spacing: 0.7px;
  }
  .field-label .req { color: var(--primary-mid); margin-left: 2px; }

  .field-input {
    height: 42px; padding: 0 14px;
    border: 1.5px solid var(--border);
    border-radius: 11px;
    background: rgba(255,255,255,0.75);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-dark);
    outline: none; transition: all 0.2s;
    backdrop-filter: blur(4px);
  }
  .field-input:focus { border-color: var(--primary-mid); box-shadow: 0 0 0 3px rgba(190,113,209,0.12); background: white; }
  .field-input[readonly] { background: var(--primary-ultra-light); color: var(--text-muted); cursor: not-allowed; }

  .field-select {
    height: 42px; padding: 0 14px;
    border: 1.5px solid var(--border);
    border-radius: 11px;
    background: rgba(255,255,255,0.75);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-dark);
    outline: none; transition: all 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%238b3b9e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    cursor: pointer;
  }
  .field-select:focus { border-color: var(--primary-mid); box-shadow: 0 0 0 3px rgba(190,113,209,0.12); }

  /* checkbox row */
  .checkbox-row { display: flex; align-items: center; gap: 9px; height: 42px; }
  .checkbox-row input[type=checkbox] {
    width: 17px; height: 17px; accent-color: var(--primary); cursor: pointer; border-radius: 4px;
  }
  .checkbox-row label { font-size: 13.5px; color: var(--text-mid); cursor: pointer; font-weight: 500; }

  /* ---- Action bar ---- */
  .action-bar {
    padding: 18px 28px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between;
    background: rgba(248,240,251,0.60);
  }
  .action-bar-left { display: flex; gap: 10px; flex-wrap: wrap; }
  .action-bar-right { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* ---- Buttons ---- */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 20px; border-radius: 11px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
    transition: all 0.2s; white-space: nowrap; letter-spacing: 0.1px;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%);
    color: white; box-shadow: 0 4px 14px rgba(139,59,158,0.30);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,59,158,0.38); }
  .btn-primary:active { transform: translateY(0); }
  .btn-outline {
    background: rgba(255,255,255,0.75); color: var(--primary);
    border: 1.5px solid var(--glass-border);
    backdrop-filter: blur(8px);
  }
  .btn-outline:hover { background: var(--primary-ultra-light); border-color: var(--primary-mid); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1.5px solid transparent; }
  .btn-ghost:hover { background: rgba(139,59,158,0.07); color: var(--primary); }
  .btn-success {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white; box-shadow: 0 4px 14px rgba(34,197,94,0.25);
  }
  .btn-success:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.35); }
  .btn-new {
    background: linear-gradient(135deg, var(--primary), var(--primary-mid));
    color: white; padding: 7px 16px; font-size: 12.5px; border-radius: 9px;
    box-shadow: 0 2px 10px rgba(139,59,158,0.25);
  }

  /* ---- Mandatory note ---- */
  .mandatory-note {
    font-size: 12px; color: var(--text-muted); font-style: italic;
    padding: 10px 28px 0; text-align: right;
  }
  .mandatory-note span { color: var(--primary-mid); font-weight: 600; }

  /* ---- Changes panel ---- */
  .changes-section { margin-top: 28px; }
  .changes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
  @media (max-width: 700px) { .changes-grid { grid-template-columns: 1fr; } }

  .change-panel { background: rgba(255,255,255,0.55); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .change-panel-header {
    background: linear-gradient(90deg, rgba(139,59,158,0.08), rgba(190,113,209,0.06));
    padding: 12px 18px;
    font-size: 13px; font-weight: 700; color: var(--primary);
    border-bottom: 1px solid var(--border);
    text-align: center; letter-spacing: 0.2px;
  }
  .change-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .change-table th {
    padding: 8px 14px; text-align: left; font-size: 11px; font-weight: 600;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
    background: rgba(248,240,251,0.5); border-bottom: 1px solid var(--border);
  }
  .change-table td { padding: 9px 14px; border-bottom: 1px solid rgba(139,59,158,0.06); vertical-align: middle; }
  .change-table tr:last-child td { border-bottom: none; }
  .change-table tr.group-row td { font-weight: 700; font-size: 12.5px; color: var(--text-mid); background: rgba(230,198,237,0.12); padding-top: 12px; }

  .c-green { color: #16a34a; font-weight: 600; }
  .c-red   { color: #dc2626; font-weight: 600; }
  .c-black { color: var(--text-dark); }

  /* ---- Notice banner ---- */
  .notice-banner {
    margin: 0 0 20px;
    padding: 11px 18px;
    border-radius: 12px;
    background: rgba(190,113,209,0.10);
    border: 1px solid rgba(190,113,209,0.25);
    font-size: 12.5px; color: var(--primary);
    display: flex; align-items: center; gap: 8px;
  }

  /* ---- Toast ---- */
  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    background: white;
    border: 1.5px solid var(--glass-border);
    border-radius: 14px; padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 10px 40px rgba(139,59,158,0.18);
    backdrop-filter: blur(20px);
    font-size: 13.5px; font-weight: 500; color: var(--text-dark);
    animation: slideUp 0.3s ease;
    max-width: 320px;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .toast-icon { font-size: 18px; }

  /* ---- Divider ---- */
  .divider { height: 1px; background: var(--border); margin: 0 28px; }
`;

// ---- Icons (inline SVG) ----
const Icon = {
  Home: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  OpenLink: () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
    </svg>
  ),
  Changes: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
};

// ---- Main Component ----
export default function ECOApprovePage() {
  const [started, setStarted] = useState(false);
  const [title, setTitle] = useState("Testing ECOS");
  const [ecoType, setEcoType] = useState<ECOType>("Bill of Materials");
  const [product, setProduct] = useState("Iphone 17");
  const [bom, setBom] = useState("Iphone 17");
  const [user, setUser] = useState("Admin1");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [versionUpdate, setVersionUpdate] = useState(true);
  const [status, setStatus] = useState<StatusType>("in_progress");
  const [showChanges, setShowChanges] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);

  const showToast = (msg: string, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStart = () => {
    if (!title || !ecoType || !product || !user) {
      showToast("Please fill all mandatory fields.", "⚠️");
      return;
    }
    setStarted(true);
    showToast("ECO started. Fields are now read-only.");
  };

  const handleApprove = () => {
    setStatus("approved");
    showToast("ECO approved successfully!", "🎉");
  };

  const statusCycle: StatusType[] = ["in_progress", "approved", "cancelled"];
  const handleStatusClick = () => {
    if (started) return;
    const idx = statusCycle.indexOf(status);
    setStatus(statusCycle[(idx + 1) % statusCycle.length]);
  };

  const statusLabel: Record<StatusType, string> = {
    approved: "Approved",
    in_progress: "In Progress",
    cancelled: "Cancelled",
  };

  const bomComponents: ComponentChange[] = [
    { name: "Component 1", v2: "1 Units", v1: "2 Units", color: "red" },
    { name: "Component 2", v2: "2 Units", v1: "1 Units", color: "green" },
    { name: "Component 3", v2: "5 Units", v1: "3 Units", color: "green" },
  ];
  const bomOperations: OperationChange[] = [
    { name: "Assembly - Line 1", v2: "30:00 Minutes", v1: "10 Minutes", color: "green" },
    { name: "Assembly - Line 2", v2: "60:00 Minutes", v1: "75 Minutes", color: "red" },
  ];
  const productChanges: ProductChange[] = [
    { field: "Sales Price", v2: "$230", v1: "$240", color: "red" },
    { field: "Cost Price", v2: "$120", v1: "$110", color: "green" },
    { field: "Attachments", v2: "test.pdf, Exam.pdf", v1: "Statement.pdf, Exam.pdf", color: "green" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="eco-root">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">EC</div>
            <nav className="topbar-breadcrumb">
              <Icon.Home />
              <span>Home</span>
              <span className="sep"><Icon.ChevronRight /></span>
              <span>O BoA</span>
              <span className="sep"><Icon.ChevronRight /></span>
              <span className="active">ECO Approval</span>
            </nav>
          </div>
          <div className="topbar-title">Master UI</div>
        </header>

        <main className="page-wrap">
          {/* Notice */}
          <div className="notice-banner">
            <Icon.Info />
            Mandatory fields must be filled and saved before starting. Once <strong>&nbsp;Start&nbsp;</strong> is clicked, all fields become read-only.
          </div>

          {/* Main Card */}
          <div className="glass-card">
            {/* Section Header */}
            <div className="section-header">
              <div>
                <div className="section-title">Engineering Change Order</div>
                <div className="section-sub">ECOs are only possible for active status types</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Status pill */}
                <div
                  className={`status-pill ${status}`}
                  onClick={handleStatusClick}
                  title={started ? "Status locked after start" : "Click to cycle status"}
                  style={{ cursor: started ? "default" : "pointer" }}
                >
                  <span className="dot" />
                  {statusLabel[status]}
                </div>
                <button className="btn btn-new">New</button>
              </div>
            </div>

            {/* Mandatory note */}
            <div className="mandatory-note"><span>*</span> Mandatory field</div>

            {/* Form */}
            <div className="form-body">
              <div className="form-field full-width">
                <label className="field-label">Title <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  readOnly={started}
                  placeholder="Enter ECO title"
                />
              </div>

              <div className="form-field">
                <label className="field-label">ECO Type <span className="req">*</span></label>
                <select
                  className="field-select"
                  value={ecoType}
                  onChange={e => setEcoType(e.target.value as ECOType)}
                  disabled={started}
                >
                  <option>Bill of Materials</option>
                  <option>Product</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">Product <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  readOnly={started}
                  placeholder="Select product"
                />
              </div>

              {ecoType === "Bill of Materials" && (
                <div className="form-field">
                  <label className="field-label">Bill of Materials <span className="req">*</span></label>
                  <input
                    className="field-input"
                    value={bom}
                    onChange={e => setBom(e.target.value)}
                    readOnly={started}
                    placeholder="Select BoM"
                  />
                </div>
              )}

              <div className="form-field">
                <label className="field-label">User <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  readOnly={started}
                  placeholder="Assigned user"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Effective Date</label>
                <input
                  className="field-input"
                  type="date"
                  value={effectiveDate}
                  onChange={e => setEffectiveDate(e.target.value)}
                  readOnly={started}
                />
              </div>

              <div className="form-field full-width">
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="versionUpdate"
                    checked={versionUpdate}
                    onChange={e => !started && setVersionUpdate(e.target.checked)}
                    disabled={started}
                  />
                  <label htmlFor="versionUpdate">
                    Version Update
                    <span style={{ fontSize: 11, color: "#aaa", marginLeft: 8 }}>
                      (If unchecked, changes are applied to the same version)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Action bar */}
            <div className="action-bar">
              <div className="action-bar-left">
                {!started ? (
                  <button className="btn btn-primary" onClick={handleStart}>
                    ▶ Start
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={handleApprove}
                    disabled={status === "approved"}
                  >
                    <Icon.Check /> Approve
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  onClick={() => setShowChanges(v => !v)}
                >
                  <Icon.Changes /> {showChanges ? "Hide" : "View"} Changes
                </button>
              </div>
              <div className="action-bar-right">
                {ecoType === "Bill of Materials" && (
                  <button className="btn btn-outline">
                    <Icon.OpenLink /> Open Bill of Materials
                  </button>
                )}
                {ecoType === "Product" && (
                  <button className="btn btn-outline">
                    <Icon.OpenLink /> Open Product
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Changes Panel */}
          {showChanges && (
            <div className="changes-section">
              <div className="glass-card">
                <div className="section-header">
                  <div>
                    <div className="section-title">ECO Changes Overview</div>
                    <div className="section-sub">
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>Green</span> = added &nbsp;·&nbsp;
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>Red</span> = removed &nbsp;·&nbsp;
                      <span style={{ color: "#333", fontWeight: 600 }}>Black</span> = unchanged
                    </div>
                  </div>
                </div>
                <div className="changes-grid">
                  {/* BoM Changes */}
                  <div className="change-panel">
                    <div className="change-panel-header">{bom} — ECO Changes</div>
                    <table className="change-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Version 2</th>
                          <th>Version 1</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="group-row">
                          <td colSpan={3}>▸ Components</td>
                        </tr>
                        {bomComponents.map((c, i) => (
                          <tr key={i}>
                            <td className={`c-${c.color}`}>{c.name}</td>
                            <td className={`c-${c.color}`}>{c.v2}</td>
                            <td className="c-black">{c.v1}</td>
                          </tr>
                        ))}
                        <tr className="group-row">
                          <td colSpan={3}>▸ Operations</td>
                        </tr>
                        {bomOperations.map((o, i) => (
                          <tr key={i}>
                            <td className={`c-${o.color}`}>{o.name}</td>
                            <td className={`c-${o.color}`}>{o.v2}</td>
                            <td className="c-black">{o.v1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Product Changes */}
                  <div className="change-panel">
                    <div className="change-panel-header">{product} — ECO Changes</div>
                    <table className="change-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Version 2</th>
                          <th>Version 1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productChanges.map((p, i) => (
                          <tr key={i}>
                            <td className="c-black" style={{ fontWeight: 500 }}>{p.field}</td>
                            <td className={`c-${p.color}`}>{p.v2}</td>
                            <td className="c-black">{p.v1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Toast */}
        {toast && (
          <div className="toast">
            <span className="toast-icon">{toast.icon}</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  );
}