import { authRegistry, authRouter } from './auth/auth.router';
import { categoriesRegistry, categoriesRouter } from './categories/categories.router';
import { healthCheckRegistry, healthCheckRouter } from './healthCheck/healthCheck.router';
import { usersRegistry, usersRouter } from './users/users.router';
import { expensesRegistry, expensesRouter } from './expenses/expenses.router';
import { incomesRegistry, incomesRouter } from './incomes/incomes.router';
import { budgetsRegistry, budgetsRouter } from './budgets/budgets.router';
import { savingGoalsRegistry, savingGoalsRouter } from './saving-goals/saving-goals.router';
import { analyticsRegistry, analyticsRouter } from './analytics/analytics.router';
import { notificationsRegistry, notificationsRouter } from './notifications/notifications.router';
import { uploadRegistry, uploadRouter } from './upload/upload.router';
import { reportsRegistry, reportsRouter } from './reports/reports.router';
import { aiRegistry, aiRouter } from './ai/ai.router';
import { adminRegistry, adminRouter } from './admin/admin.router';

export const Registries = [
	healthCheckRegistry,
	authRegistry,
	usersRegistry,
	categoriesRegistry,
	expensesRegistry,
	incomesRegistry,
	budgetsRegistry,
	savingGoalsRegistry,
	analyticsRegistry,
	notificationsRegistry,
	uploadRegistry,
	reportsRegistry,
	aiRegistry,
	adminRegistry,
];

export const Modules = {
	healthCheckRouter,
	authRouter,
	usersRouter,
	categoriesRouter,
	expensesRouter,
	incomesRouter,
	budgetsRouter,
	savingGoalsRouter,
	analyticsRouter,
	notificationsRouter,
	uploadRouter,
	reportsRouter,
	aiRouter,
	adminRouter,
};
