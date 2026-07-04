import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { CategoryChart } from '@/components/analytics/CategoryChart';
import { BarChartComponent } from '@/components/analytics/BarChartComponent';
import { TransactionHeatmap } from '@/components/analytics/TransactionHeatmap';

export function DashboardPage() {
  const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [data, setData] = useState<any>({ summary: null, pie: [], bar: [], heatmap: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = `?month=${date.month}&year=${date.year}`;
        const [sum, pie, bar, heat] = await Promise.all([
          apiClient.get(`/api/analytics/summary${params}`).catch(() => ({ data: { data: null } })),
          apiClient.get(`/api/analytics/by-category${params}`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/api/analytics/monthly-comparison${params}`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/api/analytics/heatmap${params}`).catch(() => ({ data: { data: [] } })),
        ]);
        setData({ summary: sum.data?.data, pie: pie.data?.data, bar: bar.data?.data, heatmap: heat.data?.data });
      } finally { setLoading(false); }
    };
    fetchData();
  }, [date]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow border">
        <h2 className="font-bold text-black">Thời gian:</h2>
        <select className="border p-2 rounded text-black bg-white " value={date.month} onChange={(e) => setDate({...date, month: Number(e.target.value)})}>
          {[...Array(12)].map((_, i) => <option key={i} value={i+1}>Tháng {i+1}</option>)}
        </select>
        <input type="number" className="border p-2 rounded text-black bg-white w-20" value={date.year} onChange={(e) => setDate({...date, year: Number(e.target.value)})} />
      </div>

      {loading ? <div>Đang tải dữ liệu...</div> : (
        <div className="space-y-6">
          <SummaryCards data={data.summary} budget={data.budget} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="font-semibold text-black mb-4">Chi tiêu danh mục</h2>
              <CategoryChart data={data.pie} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="font-semibold text-black mb-4">Thu nhập vs Chi tiêu</h2>
              <BarChartComponent data={data.bar} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="font-semibold text-black mb-4">Mật độ giao dịch</h2>
            <TransactionHeatmap data={data.heatmap} year={date.year} month={date.month} />
          </div>
        </div>
      )}
    </div>
  );
}