import 'reflect-metadata';
import 'dotenv/config';

import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import http from 'http';

import { openAPIRouter } from './swagger';
import { appEnv } from './configs';
import { Modules } from './modules';
import {
	errorHandlerMiddleware,
	requestContextMiddleware,
	setCookieMiddleware,
	SocketService,
} from './common';
import { setupAiEventSubscribers } from './modules/ai';

const app: Express = express();
const server = http.createServer(app);

// Initialize WebSockets
SocketService.initialize(server);
setupAiEventSubscribers();

app.use(express.json());

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

app.use(requestContextMiddleware);

app.use(setCookieMiddleware);

// Passport middleware
app.use(passport.initialize());

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan('combined'));

app.use('/health-check', Modules.healthCheckRouter);
app.use('/auth', Modules.authRouter);
app.use('/users', Modules.usersRouter);
app.use('/categories', Modules.categoriesRouter);
app.use('/expenses', Modules.expensesRouter);
app.use('/incomes', Modules.incomesRouter);
app.use('/budgets', Modules.budgetsRouter);
app.use('/saving-goals', Modules.savingGoalsRouter);
app.use('/analytics', Modules.analyticsRouter);
app.use('/notifications', Modules.notificationsRouter);
app.use('/upload', Modules.uploadRouter);
app.use('/reports', Modules.reportsRouter);
app.use('/ai', Modules.aiRouter);
app.use('/admin', Modules.adminRouter);

app.use(errorHandlerMiddleware);

app.use(openAPIRouter);

server.listen(appEnv.PORT, '0.0.0.0', () => {
	const { NODE_ENV, HOST, PORT } = appEnv;
	console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}/api`);
	console.log(`Actual server address:`, server.address());
});
