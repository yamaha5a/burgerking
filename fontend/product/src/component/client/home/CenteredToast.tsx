import { useEffect } from "react";

type CenteredToastProps = {
  show: boolean;
  message: string;
  variant?: "success" | "danger" | "info";
  durationMs?: number;
  onClose: () => void;
};

export default function CenteredToast({
  show,
  message,
  variant = "success",
  durationMs = 1800,
  onClose,
}: CenteredToastProps) {
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(t);
  }, [show, durationMs, onClose]);

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 2000, background: "rgba(0,0,0,0.15)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`alert alert-${variant} shadow mb-0`}
        role="alert"
        style={{ minWidth: 280, maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>{message}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

