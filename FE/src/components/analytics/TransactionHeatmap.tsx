import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

export const TransactionHeatmap = ({ data, year, month }: { data: any[], year: number, month: number }) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        
        values={data || []} 
        classForValue={(value: any) => value ? `color-scale-${value.count}` : 'color-empty'}
      />
    </div>
  );
};