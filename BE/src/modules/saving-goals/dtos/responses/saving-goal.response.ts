import { SavingDeposit, SavingGoal } from '@prisma/client';
import z from 'zod';

// ─── Deposit Response ─────────────────────────────────────────────────────────

export class SavingDepositResponseDto {
	id: string;
	amount: string;
	note: string | null;
	depositedAt: Date;

	constructor(deposit: SavingDeposit) {
		this.id = deposit.id;
		this.amount = deposit.amount.toString();
		this.note = deposit.note;
		this.depositedAt = deposit.depositedAt;
	}
}

export const savingDepositResponseSchema = z.object({
	id: z.string(),
	amount: z.string(),
	note: z.string().nullable(),
	depositedAt: z.date(),
});

// ─── Saving Goal Response ─────────────────────────────────────────────────────

type SavingGoalWithDeposits = SavingGoal & { deposits?: SavingDeposit[] };

export class SavingGoalResponseDto {
	id: string;
	title: string;
	targetAmount: string;
	savedAmount: string;
	progressPercentage: number;
	remainingAmount: string;
	deadline: Date | null;
	isCompleted: boolean;
	note: string | null;
	deposits?: SavingDepositResponseDto[];

	constructor(goal: SavingGoalWithDeposits) {
		this.id = goal.id;
		this.title = goal.title;
		this.deadline = goal.deadline;
		this.isCompleted = goal.isCompleted;
		this.note = goal.note;

		const target = Number(goal.targetAmount);
		const saved = Number(goal.savedAmount);

		this.targetAmount = goal.targetAmount.toString();
		this.savedAmount = goal.savedAmount.toString();

		this.remainingAmount = Math.max(0, target - saved).toString();
		this.progressPercentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
		// Format to 2 decimal places max
		this.progressPercentage = Number(this.progressPercentage.toFixed(2));

		if (goal.deposits) {
			this.deposits = goal.deposits.map((d) => new SavingDepositResponseDto(d));
		}
	}
}

export const savingGoalResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	targetAmount: z.string(),
	savedAmount: z.string(),
	progressPercentage: z.number(),
	remainingAmount: z.string(),
	deadline: z.date().nullable(),
	isCompleted: z.boolean(),
	note: z.string().nullable(),
	deposits: z.array(savingDepositResponseSchema).optional(),
});
