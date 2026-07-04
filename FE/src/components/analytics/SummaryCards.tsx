export const SummaryCards = ({ data, budget }: { data: any, budget: any }) => {
  // Tính % chi tiêu
  const spent = data?.totalExpense || 0;
  const limit = budget?.amount || 1; // Tránh chia cho 0
  const percentage = Math.min((spent / limit) * 100, 100);

  // Chọn màu theo % (Xanh < 70%, Vàng < 90%, Đỏ >= 90%)
  const barColor = percentage < 70 ? 'bg-green-500' : percentage < 90 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* 3 Thẻ hiện tại */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
          <p className="text-green-800 text-sm">Thu nhập</p>
          <h3 className="text-2xl font-bold text-gray-900">{Number(data?.totalIncome || 0).toLocaleString()} đ</h3>
        </div>
        <div className="p-6 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-800 text-sm">Chi tiêu</p>
          <h3 className="text-2xl font-bold text-gray-900">{Number(spent).toLocaleString()} đ</h3>
        </div>
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-blue-800 text-sm">Số dư</p>
          <h3 className="text-2xl font-bold text-gray-900">{Number(data?.netBalance || 0).toLocaleString()} đ</h3>
        </div>
      </div>

      {/* Thêm Progress Bar */}
      <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-semibold text-gray-700">Ngân sách tháng: {Number(limit).toLocaleString()} đ</span>
          <span className="font-bold text-gray-900">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${barColor}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};