// ============================================================
// Dashboard Page — Placeholder
// SidebarProvider đã được xử lý bởi AppLayout.
// ============================================================
import { useEffect, useState } from 'react';
import { getBudgets } from '@/lib/budget.service'; 
import { BudgetCard } from '@/components/budgets/BudgetCard'; 
export function Dashboard() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const data = await getBudgets(now.getMonth() + 1, now.getFullYear());
      setBudgets(data);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Phần tiêu đề */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#37352F]">Tổng quan</h2>
      </div>

      {/* Phần 4 Cards cũ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Tổng thu", "Tổng chi", "Số dư", "Tiết kiệm"].map((title) => (
          <div key={title} className="p-5 rounded-lg border border-[#E8E7E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#9B9A97] font-medium uppercase tracking-wider mb-2">{title}</p>
            <p className="text-xl font-semibold text-[#37352F]">—</p>
          </div>
        ))}
      </div>

      {/* PHẦN MỚI: Tích hợp Budget Module vào đây */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-[#37352F] mb-4">Ngân sách tháng này</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b: any) => (
            <BudgetCard 
               key={b.id} 
               title={b.title}      
               spent={b.spent}     
               limit={b.limit}      
/>
          ))}
        </div>
      </div>
    </div>
  );
}
