// ============================================================
// Dashboard Page — Placeholder
// SidebarProvider đã được xử lý bởi AppLayout.
// ============================================================

export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Placeholder — Phase sau sẽ build Dashboard đầy đủ */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#37352F]">
          Tổng quan
        </h2>
        <p className="text-sm text-[#9B9A97]">
          Dashboard đang được xây dựng trong Phase tiếp theo.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Tổng thu", "Tổng chi", "Số dư", "Tiết kiệm"].map((title) => (
          <div
            key={title}
            className="
              p-5 rounded-lg border border-[#E8E7E5] bg-white
              shadow-[0_1px_3px_rgba(0,0,0,0.08)]
            "
          >
            <p className="text-xs text-[#9B9A97] font-medium uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-xl font-semibold text-[#37352F]">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
