import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function CategoryChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data?.map((item: any) => (
            <Cell key={item.name} fill={item.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}