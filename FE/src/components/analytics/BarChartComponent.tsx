import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const BarChartComponent = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#22c55e" name="Thu nhập" />
        <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);