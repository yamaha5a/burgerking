import { useEffect, useState } from "react";

function formatNow(date: Date) {
  return date.toLocaleString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Header() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const timeString = formatNow(now);

  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white shadow-sm">
      <div>
        <h1 className="h5 mb-1">Bảng điều khiển</h1>
        <p className="mb-0 text-muted small">
          Quản lý hệ thống admin một cách trực quan và dễ dùng
        </p>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="text-end me-2">
          <div className="small text-muted">Thời gian hiện tại</div>
          <div className="fw-semibold">{timeString}</div>
        </div>

        <div className="d-flex align-items-center">
          <div className="me-2 text-end">
            <div className="fw-semibold">Admin</div>
            <div className="small text-muted">Quản trị viên hệ thống</div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-sm"
            style={{ width: 40, height: 40, backgroundColor: "#f1f3f5" }}
          >
            <span className="fw-bold text-secondary">A</span>
          </button>
        </div>
      </div>
    </header>
  );
}
