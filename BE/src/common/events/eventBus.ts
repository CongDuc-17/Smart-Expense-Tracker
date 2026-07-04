import { EventEmitter } from 'events';

class AppEventBus extends EventEmitter {
	constructor() {
		super();
		// Increase max listeners if needed, default is 10
		this.setMaxListeners(20);
	}
}

export const eventBus = new AppEventBus();

// Type-safe event names
export enum AppEvents {
	EXPENSE_MUTATED = 'expense.mutated',
	GOAL_REACHED = 'goal.reached',
	EXPENSE_IMAGE_UPLOADED = 'expense.image_uploaded',
}

// Event payload types
export interface ExpenseMutatedEventPayload {
	userId: string;
	categoryId: string;
	month: number;
	year: number;
}

export interface GoalReachedEventPayload {
	userId: string;
	goalId: string;
	title: string;
}

export interface ExpenseImageUploadedEventPayload {
	expenseId: string;
	imageUrl: string;
}
