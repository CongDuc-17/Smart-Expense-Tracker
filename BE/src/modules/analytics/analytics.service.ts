import { PrismaService } from '../database';

// 1. Định nghĩa lại interface cho khớp với kiểu Decimal của Prisma (thường là có hàm toNumber())
interface Budget { limitAmount: any; spentAmount: any; alertStatus: string; }
interface Goal { targetAmount: any; savedAmount: any; isCompleted: boolean; }
interface ExpenseGroup { categoryId: string | null; _sum: { amount: any } }

export class AnalyticsService {
    constructor(private readonly prismaService = new PrismaService()) {}

    private buildTrendMonths(month: number, year: number) {
        const months = [] as Array<{ month: number; year: number; label: string }>;
        for (let offset = 5; offset >= 0; offset -= 1) {
            const date = new Date(year, month - 1 - offset, 1);
            months.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                label: date.toLocaleString('vi-VN', { month: 'short', year: 'numeric' }),
            });
        }
        return months;
    }
    // Ví dụ mẫu cho hàm Heatmap
async getMonthlyComparison(query: any) {
  const { month, year } = query;
  const userId = query.userId; // Đảm bảo lấy đúng userId từ query hoặc auth
  const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
  const startOfNextMonth = new Date(Number(year), Number(month), 1);

  // Lấy dữ liệu gộp theo ngày
  const expenses = await this.prismaService.expense.groupBy({
    by: ['date'],
    where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
    _sum: { amount: true },
  });

  const incomes = await this.prismaService.income.groupBy({
    by: ['date'],
    where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
    _sum: { amount: true },
  });

  // Map về dạng { date, income, expense }
  return expenses.map(e => ({
    date: e.date.toISOString().split('T')[0],
    expense: Number(e._sum.amount || 0),
    income: Number(incomes.find(i => i.date.getTime() === e.date.getTime())?._sum.amount || 0)
  }));
}

async getHeatmap(query: any) {
  const { month, year } = query;
  const userId = query.userId;
  const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
  const startOfNextMonth = new Date(Number(year), Number(month), 1);

  // Lấy tổng số lượng giao dịch mỗi ngày
  const transactions = await this.prismaService.expense.groupBy({
    by: ['date'],
    where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
    _count: { id: true },
  });

  return transactions.map(t => ({
    date: t.date.toISOString().split('T')[0],
    count: t._count.id
  }));
}
    async getSummary({ userId, month, year }: { userId: string; month: number; year: number }) {
        const startOfMonth = new Date(year, month - 1, 1);
        const startOfNextMonth = new Date(year, month, 1);
        const trendMonths = this.buildTrendMonths(month, year);
        const trendStart = new Date(trendMonths[0].year, trendMonths[0].month - 1, 1);
        const lastTrendMonth = trendMonths[trendMonths.length - 1];
        const trendEnd = new Date(lastTrendMonth.year, lastTrendMonth.month, 1);

        const [incomeSum, expenseSum, budgets, goals, expenseGroups] = await Promise.all([
            this.prismaService.income.aggregate({
                where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
                _sum: { amount: true },
            }),
            this.prismaService.expense.aggregate({
                where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
                _sum: { amount: true },
            }),
            this.prismaService.budget.findMany({ where: { userId, month, year } }),
            this.prismaService.savingGoal.findMany({ where: { userId } }),
            this.prismaService.expense.groupBy({
                by: ['categoryId'],
                where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: startOfNextMonth } },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } },
            }),
        ]);

        const categories = await this.prismaService.category.findMany({
            where: { id: { in: expenseGroups.map((g) => g.categoryId ?? '') } },
            select: { id: true, name: true, icon: true, color: true },
        });

        const expenseByCategory = expenseGroups.map((group: ExpenseGroup) => {
            const category = categories.find((c) => c.id === group.categoryId);
            return {
                id: group.categoryId ?? 'unknown',
                name: category?.name ?? 'Unknown',
                icon: category?.icon ?? null,
                color: category?.color ?? '#37352F',
                amount: group._sum.amount?.toString() ?? '0',
            };
        });

        const [expenses, incomes] = await Promise.all([
            this.prismaService.expense.findMany({
                where: { userId, deletedAt: null, date: { gte: trendStart, lt: trendEnd } },
                select: { amount: true, date: true },
            }),
            this.prismaService.income.findMany({
                where: { userId, deletedAt: null, date: { gte: trendStart, lt: trendEnd } },
                select: { amount: true, date: true },
            }),
        ]);

        const monthlyTrend = trendMonths.map((item) => {
            const calculateTotal = (data: Array<{ amount: any; date: Date }>) => 
                data
                    .filter((row) => {
                        const d = new Date(row.date);
                        return d.getFullYear() === item.year && d.getMonth() + 1 === item.month;
                    })
                    .reduce((sum: number, row) => sum + Number(row.amount || 0), 0);

            return {
                label: item.label,
                income: calculateTotal(incomes).toString(),
                expense: calculateTotal(expenses).toString(),
            };
        });

        return {
            totalIncome: incomeSum._sum.amount?.toString() ?? '0',
            totalExpense: expenseSum._sum.amount?.toString() ?? '0',
            // Sử dụng Number() ép kiểu cho Decimal
            budgetLimit: budgets.reduce((acc: number, item: any) => acc + Number(item.limitAmount || 0), 0).toString(),
            budgetSpent: budgets.reduce((acc: number, item: any) => acc + Number(item.spentAmount || 0), 0).toString(),
            budgetAlertCount: budgets.filter((item: any) => item.alertStatus !== 'NORMAL').length,
            totalGoalTarget: goals.reduce((acc: number, item: any) => acc + Number(item.targetAmount || 0), 0).toString(),
            totalGoalSaved: goals.reduce((acc: number, item: any) => acc + Number(item.savedAmount || 0), 0).toString(),
            savingsCompleted: goals.filter((goal: any) => goal.isCompleted).length,
            expenseByCategory,
            monthlyTrend,
        };
    }

    async exportCsvReport({ userId, month, year }: { userId: string; month: number; year: number }) {
        const summary = await this.getSummary({ userId, month, year });
        const rows: Array<string[]> = [
            ['Báo cáo tổng quan', 'Giá trị'],
            ['Tổng thu nhập', summary.totalIncome],
            ['Tổng chi tiêu', summary.totalExpense],
            ['Ngân sách hạn mức', summary.budgetLimit],
            ['Ngân sách đã chi', summary.budgetSpent],
            ['Cảnh báo ngân sách', summary.budgetAlertCount.toString()],
            ['Mục tiêu tiết kiệm', summary.totalGoalTarget],
            ['Tiết kiệm hiện tại', summary.totalGoalSaved],
            ['Mục tiêu hoàn thành', summary.savingsCompleted.toString()],
            [],
            ['Danh mục chi tiêu', 'Số tiền'],
            ...summary.expenseByCategory.map((item) => [item.name, item.amount]),
        ];

        return rows
            .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');
    }
}