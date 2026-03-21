// ProductCreatePage.tsx — /products/new
// Fluid glass light theme · DM Sans · #8b3b9e #be71d1 #e6c6ed
// Role gate: ENGINEERING or ADMIN only

import React, { useState, useRef, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type UserRole = "ENGINEERING" | "ADMIN" | "VIEWER";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface ProductFormData {
  name: string;
  salePrice: string;
  costPrice: string;
  attachments: UploadedFile[];
  version: number;
}

/* ─── Accepted file types ────────────────────────────────── */
const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ACCEPTED_EXT = ".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp";

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.ms-excel": "📊",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Component ──────────────────────────────────────────── */
export default function ProductCreatePage({
  role = "ADMIN",
  onNavigate,
  onSuccess,
}: {
  role?: UserRole;
  onNavigate?: (path: string) => void;
  onSuccess?: (product: ProductFormData) => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    salePrice: "",
    costPrice: "",
    attachments: [],
    version: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nav = (path: string) => onNavigate?.(path);

  /* ── Access guard ── */
  if (role !== "ENGINEERING" && role !== "ADMIN") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
          body { font-family:'DM Sans',sans-serif; background: linear-gradient(135deg,#f3e8fb 0%,#e6c6ed 100%); min-height:100vh; display:flex; align-items:center; justify-content:center; }
          .forbidden { background:rgba(255,255,255,0.6); backdrop-filter:blur(20px); border:1px solid rgba(190,113,209,0.25); border-radius:20px; padding:48px; text-align:center; max-width:420px; }
          .forbidden h2 { color:#8b3b9e; font-size:1.4rem; font-weight:700; margin-bottom:8px; }
          .forbidden p { color:#a08aab; font-size:0.9rem; }
        `}</style>
        <div className="forbidden">
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🔒</div>
          <h2>Access Restricted</h2>
          <p>Only Engineering and Admin roles can create products.</p>
        </div>
      </>
    );
  }

  /* ── Validation ── */
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    else if (form.name.length > 255) e.name = "Max 255 characters.";
    if (!form.salePrice) e.salePrice = "Sale price is required.";
    else if (isNaN(Number(form.salePrice)) || Number(form.salePrice) < 0)
      e.salePrice = "Enter a valid positive price.";
    if (!form.costPrice) e.costPrice = "Cost price is required.";
    else if (isNaN(Number(form.costPrice)) || Number(form.costPrice) < 0)
      e.costPrice = "Enter a valid positive price.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Price input: enforce 2 decimal places display ── */
  const handlePriceBlur = (field: "salePrice" | "costPrice") => {
    const val = form[field];
    if (val && !isNaN(Number(val))) {
      setForm((f) => ({ ...f, [field]: parseFloat(val).toFixed(2) }));
    }
  };

  /* ── File processing ── */
  const processFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => ACCEPTED_MIME.includes(f.type));
    const newFiles: UploadedFile[] = valid.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
  }, []);

  const removeFile = (id: string) =>
    setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((f) => f.id !== id) }));

  /* ── Drag handlers ── */
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate upload
    setSubmitting(false);
    setSubmitted(true);
    onSuccess?.(form);
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
          *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:'DM Sans',sans-serif; background:linear-gradient(135deg,#f3e8fb 0%,#e6c6ed 100%); min-height:100vh; display:flex; align-items:center; justify-content:center; }
          .success-card { background:rgba(255,255,255,0.6); backdrop-filter:blur(20px); border:1px solid rgba(190,113,209,0.25); border-radius:24px; padding:56px 48px; text-align:center; max-width:460px; box-shadow:0 8px 32px rgba(139,59,158,0.1); }
          .success-icon { width:72px; height:72px; background:linear-gradient(135deg,#8b3b9e,#be71d1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:2rem; box-shadow:0 8px 24px rgba(139,59,158,0.3); }
          h2 { color:#8b3b9e; font-size:1.6rem; font-weight:700; margin-bottom:8px; }
          p { color:#a08aab; margin-bottom:8px; font-size:0.9rem; }
          .pname { font-weight:700; color:#2d0a3e; font-size:1rem; }
          .btn-back { margin-top:28px; padding:12px 28px; background:linear-gradient(135deg,#8b3b9e,#be71d1); color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.9rem; border:none; border-radius:12px; cursor:pointer; box-shadow:0 4px 16px rgba(139,59,158,0.3); transition:transform 0.15s,box-shadow 0.15s; }
          .btn-back:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(139,59,158,0.4); }
        `}</style>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Product Created!</h2>
          <p>Successfully created</p>
          <p className="pname">"{form.name}"</p>
          <p style={{ marginTop: "4px" }}>Version 1 · {form.attachments.length} attachment{form.attachments.length !== 1 ? "s" : ""}</p>
          <button className="btn-back" onClick={() => nav("/products")}>
            ← Back to Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:'DM Sans',sans-serif;
          background:linear-gradient(135deg,#f3e8fb 0%,#ede0f7 40%,#e6c6ed 100%);
          min-height:100vh;
          color:#1a0a22;
        }

        .glass {
          background:rgba(255,255,255,0.55);
          backdrop-filter:blur(20px) saturate(160%);
          -webkit-backdrop-filter:blur(20px) saturate(160%);
          border:1px solid rgba(190,113,209,0.25);
          border-radius:20px;
          box-shadow:0 8px 32px rgba(139,59,158,0.10),inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .page-wrap {
          max-width:720px;
          margin:0 auto;
          padding:40px 24px;
        }

        /* breadcrumb */
        .breadcrumb {
          display:flex;
          align-items:center;
          gap:8px;
          font-size:0.85rem;
          color:#a08aab;
          margin-bottom:28px;
        }
        .breadcrumb a {
          color:#be71d1;
          text-decoration:none;
          font-weight:500;
          cursor:pointer;
        }
        .breadcrumb a:hover { color:#8b3b9e; }
        .breadcrumb-sep { color:#d4b8e0; }

        /* page title */
        .page-title {
          font-size:1.9rem;
          font-weight:700;
          letter-spacing:-0.03em;
          background:linear-gradient(135deg,#8b3b9e 0%,#be71d1 100%);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          margin-bottom:6px;
        }
        .page-subtitle {
          font-size:0.875rem;
          color:#8b6b99;
          margin-bottom:36px;
        }

        /* form card */
        .form-card { padding:36px; }

        /* section label */
        .section-label {
          font-size:0.7rem;
          font-weight:700;
          letter-spacing:0.1em;
          text-transform:uppercase;
          color:#be71d1;
          margin-bottom:18px;
          display:flex;
          align-items:center;
          gap:10px;
        }
        .section-label::after {
          content:'';
          flex:1;
          height:1px;
          background:rgba(190,113,209,0.2);
        }

        /* field */
        .field { margin-bottom:22px; }
        .field-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:22px; }

        label {
          display:block;
          font-size:0.82rem;
          font-weight:600;
          color:#5a2a6e;
          margin-bottom:7px;
          letter-spacing:0.01em;
        }
        label .req { color:#be71d1; margin-left:2px; }
        label .optional {
          font-size:0.75rem;
          font-weight:400;
          color:#b0a0bb;
          margin-left:4px;
        }

        input[type="text"],
        input[type="number"],
        input[type="tel"] {
          width:100%;
          padding:12px 16px;
          font-family:'DM Sans',sans-serif;
          font-size:0.9rem;
          color:#1a0a22;
          background:rgba(255,255,255,0.7);
          border:1.5px solid rgba(190,113,209,0.25);
          border-radius:12px;
          outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
          backdrop-filter:blur(8px);
        }
        input:focus {
          border-color:#be71d1;
          box-shadow:0 0 0 3px rgba(190,113,209,0.15);
        }
        input.has-error {
          border-color:#e8567a;
          box-shadow:0 0 0 3px rgba(232,86,122,0.1);
        }
        input:disabled {
          background:rgba(230,198,237,0.25);
          color:#a08aab;
          cursor:not-allowed;
        }

        .error-msg {
          font-size:0.78rem;
          color:#c94f6d;
          margin-top:5px;
          display:flex;
          align-items:center;
          gap:4px;
        }

        /* price prefix wrapper */
        .price-wrapper { position:relative; }
        .price-prefix {
          position:absolute;
          left:14px;
          top:50%;
          transform:translateY(-50%);
          color:#8b3b9e;
          font-weight:600;
          font-size:0.9rem;
          pointer-events:none;
          z-index:1;
        }
        .price-wrapper input { padding-left:32px; }

        /* readonly version field */
        .version-field {
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px 16px;
          background:rgba(230,198,237,0.25);
          border:1.5px dashed rgba(190,113,209,0.3);
          border-radius:12px;
        }
        .version-num {
          font-size:1.5rem;
          font-weight:700;
          color:#8b3b9e;
          line-height:1;
        }
        .version-note {
          font-size:0.78rem;
          color:#a08aab;
          line-height:1.4;
        }

        /* char counter */
        .char-counter {
          font-size:0.75rem;
          color:#b0a0bb;
          text-align:right;
          margin-top:4px;
        }
        .char-counter.near { color:#c97a3e; }
        .char-counter.over { color:#c94f6d; }

        /* drop zone */
        .drop-zone {
          border:2px dashed rgba(190,113,209,0.4);
          border-radius:16px;
          padding:36px 24px;
          text-align:center;
          cursor:pointer;
          transition:all 0.2s;
          background:rgba(255,255,255,0.35);
        }
        .drop-zone:hover, .drop-zone.dragging {
          border-color:#8b3b9e;
          background:rgba(230,198,237,0.25);
        }
        .drop-zone-icon { font-size:2.4rem; margin-bottom:12px; }
        .drop-zone-title {
          font-size:0.95rem;
          font-weight:600;
          color:#5a2a6e;
          margin-bottom:4px;
        }
        .drop-zone-sub {
          font-size:0.8rem;
          color:#a08aab;
        }
        .browse-link {
          color:#be71d1;
          font-weight:600;
          cursor:pointer;
          text-decoration:underline;
          text-decoration-color:rgba(190,113,209,0.4);
        }

        /* file list */
        .file-list { margin-top:16px; display:flex; flex-direction:column; gap:10px; }

        .file-item {
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px 14px;
          background:rgba(255,255,255,0.6);
          border:1px solid rgba(190,113,209,0.2);
          border-radius:12px;
          backdrop-filter:blur(8px);
        }
        .file-thumb {
          width:40px; height:40px;
          border-radius:8px;
          object-fit:cover;
          flex-shrink:0;
        }
        .file-icon {
          width:40px; height:40px;
          border-radius:8px;
          background:rgba(230,198,237,0.4);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.3rem;
          flex-shrink:0;
        }
        .file-info { flex:1; min-width:0; }
        .file-name {
          font-size:0.85rem;
          font-weight:600;
          color:#2d0a3e;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .file-size { font-size:0.75rem; color:#a08aab; }

        .file-remove {
          width:28px; height:28px;
          border-radius:8px;
          border:none;
          background:rgba(220,50,80,0.1);
          color:#c94f6d;
          cursor:pointer;
          font-size:1rem;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          transition:background 0.15s;
        }
        .file-remove:hover { background:rgba(220,50,80,0.18); }

        /* divider */
        .divider { height:1px; background:rgba(190,113,209,0.15); margin:28px 0; }

        /* action row */
        .action-row {
          display:flex;
          justify-content:flex-end;
          gap:14px;
          margin-top:8px;
        }

        .btn-cancel {
          padding:12px 24px;
          font-family:'DM Sans',sans-serif;
          font-size:0.9rem;
          font-weight:600;
          background:rgba(230,198,237,0.35);
          color:#8b3b9e;
          border:1.5px solid rgba(190,113,209,0.3);
          border-radius:12px;
          cursor:pointer;
          transition:all 0.15s;
        }
        .btn-cancel:hover {
          background:rgba(230,198,237,0.55);
          border-color:rgba(190,113,209,0.5);
        }

        .btn-submit {
          padding:12px 28px;
          font-family:'DM Sans',sans-serif;
          font-size:0.9rem;
          font-weight:600;
          background:linear-gradient(135deg,#8b3b9e 0%,#be71d1 100%);
          color:#fff;
          border:none;
          border-radius:12px;
          cursor:pointer;
          box-shadow:0 4px 20px rgba(139,59,158,0.35);
          transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .btn-submit:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(139,59,158,0.45);
        }
        .btn-submit:disabled { opacity:0.7; cursor:not-allowed; }

        /* spinner */
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner {
          width:16px; height:16px;
          border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff;
          border-radius:50%;
          animation:spin 0.7s linear infinite;
        }

        @media (max-width:560px) {
          .field-row { grid-template-columns:1fr; }
          .form-card { padding:24px; }
          .page-title { font-size:1.5rem; }
          .action-row { flex-direction:column-reverse; }
          .btn-cancel, .btn-submit { width:100%; justify-content:center; }
        }
      `}</style>

      <div className="page-wrap">
        {/* Breadcrumb */}
       {/* Breadcrumb */}
        <div className="breadcrumb">
          <span
            className="breadcrumb-link"
            style={{
              color: "#be71d1",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
            }}
            onClick={() => nav("/products")}
          >
            Products
          </span>
          <span className="breadcrumb-sep">›</span>
          <span>New Product</span>
        </div>

        <h1 className="page-title">Create Product</h1>
        <p className="page-subtitle">Fill in the details below — version is auto-managed and starts at 1.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-card glass">

            {/* ── Section: Basic Info ── */}
            <div className="section-label">Product Details</div>

            {/* Name */}
            <div className="field">
              <label htmlFor="name">
                Product Name <span className="req">*</span>
              </label>
              <input
                id="name"
                type="text"
                maxLength={255}
                placeholder="e.g. Titanium Bracket Assembly"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "has-error" : ""}
              />
              <div className={`char-counter${form.name.length > 240 ? " near" : ""}${form.name.length > 255 ? " over" : ""}`}>
                {form.name.length} / 255
              </div>
              {errors.name && <div className="error-msg">⚠ {errors.name}</div>}
            </div>

            {/* Prices */}
            <div className="field-row">
              <div>
                <label htmlFor="salePrice">
                  Sale Price <span className="req">*</span>
                </label>
                <div className="price-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    onBlur={() => handlePriceBlur("salePrice")}
                    className={errors.salePrice ? "has-error" : ""}
                  />
                </div>
                {errors.salePrice && <div className="error-msg">⚠ {errors.salePrice}</div>}
              </div>

              <div>
                <label htmlFor="costPrice">
                  Cost Price <span className="req">*</span>
                </label>
                <div className="price-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    onBlur={() => handlePriceBlur("costPrice")}
                    className={errors.costPrice ? "has-error" : ""}
                  />
                </div>
                {errors.costPrice && <div className="error-msg">⚠ {errors.costPrice}</div>}
              </div>
            </div>

            {/* Version (readonly) */}
            <div className="field">
              <label>Version (auto-managed)</label>
              <div className="version-field">
                <div className="version-num">v1</div>
                <div className="version-note">
                  Automatically set to 1 on creation.<br />
                  Incremented only via Engineering Change Order (ECO).
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* ── Section: Attachments ── */}
            <div className="section-label">Attachments</div>

            <div
              className={`drop-zone${dragging ? " dragging" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-icon">📎</div>
              <div className="drop-zone-title">
                Drop files here or <span className="browse-link">browse</span>
              </div>
              <div className="drop-zone-sub">
                PDF, Excel (.xlsx, .xls), Images (JPG, PNG, GIF, WebP) — multiple files allowed
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXT}
              multiple
              style={{ display: "none" }}
              onChange={(e) => e.target.files && processFiles(e.target.files)}
            />

            {form.attachments.length > 0 && (
              <div className="file-list">
                {form.attachments.map((f) => (
                  <div key={f.id} className="file-item">
                    {f.preview ? (
                      <img src={f.preview} alt={f.name} className="file-thumb" />
                    ) : (
                      <div className="file-icon">{FILE_ICONS[f.type] ?? "📁"}</div>
                    )}
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="file-size">{formatBytes(f.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => removeFile(f.id)}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="divider" />

            {/* Actions */}
            <div className="action-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => nav("/products")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Creating…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}