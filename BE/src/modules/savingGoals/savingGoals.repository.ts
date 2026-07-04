import { Prisma, PrismaService } from '../database';

export class SavingGoalsRepository {
    constructor(private readonly prismaService = new PrismaService()) {}

    // Hàm hỗ trợ transaction để đảm bảo tính toàn vẹn dữ liệu
    async transaction<T>(callback: (tx: Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
        return this.prismaService.$transaction(callback);
    }

    async findMany({ userId }: { userId: string }) {
        return this.prismaService.savingGoal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prismaService.savingGoal.findUnique({
            where: { id },
        });
    }

    async create({ data }: { data: Prisma.SavingGoalUncheckedCreateInput }) {
        return this.prismaService.savingGoal.create({ data });
    }

    async update({ id, data }: { id: string; data: Prisma.SavingGoalUncheckedUpdateInput }) {
        return this.prismaService.savingGoal.update({
            where: { id },
            data,
        });
    }

    async delete({ id }: { id: string }) {
        return this.prismaService.savingGoal.delete({ where: { id } });
    }

    async createDeposit({ data }: { data: Prisma.SavingDepositUncheckedCreateInput }) {
        return this.prismaService.savingDeposit.create({ data });
    }
}