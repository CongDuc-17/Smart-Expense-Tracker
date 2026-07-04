import { SavingGoal } from '@prisma/client';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export class SavingGoalResponseDto {
    id: string;
    title: string;
    targetAmount: string;
    savedAmount: string;
    remainingAmount: string;
    percentage: number;
    deadline: string | null;
    isCompleted: boolean;
    note: string | null;
    createdAt: string;
    updatedAt: string;

    constructor(goal: SavingGoal) {
        const target = Number(goal.targetAmount);
        const saved = Number(goal.savedAmount);

        this.id = goal.id;
        this.title = goal.title;
        this.targetAmount = target.toString();
        this.savedAmount = saved.toString();
        this.remainingAmount = (target - saved).toString();
        
        this.percentage = target > 0 
            ? Number(Math.min((saved / target) * 100, 100).toFixed(2))
            : 0;
            
        this.deadline = goal.deadline instanceof Date ? goal.deadline.toISOString() : null;
        this.isCompleted = goal.isCompleted;
        this.note = goal.note;
        this.createdAt = goal.createdAt.toISOString();
        this.updatedAt = goal.updatedAt.toISOString();
    }
}

// Đây là phần Schema giúp Router không bị lỗi "no exported member"
export const savingGoalResponseDtoSchema = z.object({
    id: z.string(),
    title: z.string(),
    targetAmount: z.string(),
    savedAmount: z.string(),
    remainingAmount: z.string(),
    percentage: z.number(),
    deadline: z.string().nullable(),
    isCompleted: z.boolean(),
    note: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
}).openapi('SavingGoalResponse');