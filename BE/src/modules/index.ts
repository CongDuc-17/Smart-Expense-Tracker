import { analyticsRegistry, analyticsRouter } from './analytics/analytics.router';
import { authRegistry, authRouter } from './auth/auth.router';
import { categoriesRegistry, categoriesRouter } from './categories/categories.router';
import { expensesRegistry, expensesRouter } from './expenses/expenses.router';
import { healthCheckRegistry, healthCheckRouter } from './healthCheck/healthCheck.router';
import { incomesRegistry, incomesRouter } from './incomes/incomes.router';
import { savingGoalsRegistry, savingGoalsRouter } from './savingGoals/savingGoals.router';
import { usersRegistry, usersRouter } from './users/users.router';

export const Registries = [
	healthCheckRegistry,
	authRegistry,
	usersRegistry,
	categoriesRegistry,
	expensesRegistry,
	incomesRegistry,
	savingGoalsRegistry,
	analyticsRegistry,
];

export const Modules = {
	healthCheckRouter,
	authRouter,
	usersRouter,
	categoriesRouter,
	expensesRouter,
	incomesRouter,
	savingGoalsRouter,
	analyticsRouter,
};
