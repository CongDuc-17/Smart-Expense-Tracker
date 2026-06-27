import { authRegistry, authRouter } from './auth/auth.router';
import { categoriesRegistry, categoriesRouter } from './categories/categories.router';
import { expensesRegistry, expensesRouter } from './expenses/expenses.router';
import { healthCheckRegistry, healthCheckRouter } from './healthCheck/healthCheck.router';
import { incomesRegistry, incomesRouter } from './incomes/incomes.router';
import { usersRegistry, usersRouter } from './users/users.router';

export const Registries = [
	healthCheckRegistry,
	authRegistry,
	usersRegistry,
	categoriesRegistry,
	expensesRegistry,
	// incomesRegistry,
];

export const Modules = {
	healthCheckRouter,
	authRouter,
	usersRouter,
	categoriesRouter,
	expensesRouter,
	// incomesRouter,
};
