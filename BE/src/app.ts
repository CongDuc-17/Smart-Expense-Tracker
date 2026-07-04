import 'reflect-metadata';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { budgetsRouter } from '@/modules/budgets/budgets.router';
import { openAPIRouter } from './swagger';
import { Modules } from './modules';
import { appEnv } from './configs';
import {
    errorHandlerMiddleware,
    requestContextMiddleware,
    setCookieMiddleware,
} from './common';

const app: Express = express();


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,              
}));


app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.set('trust proxy', true);


app.use(requestContextMiddleware);
app.use(setCookieMiddleware);
app.use(passport.initialize());


app.use('/health-check', Modules.healthCheckRouter);
app.use('/auth', Modules.authRouter);
app.use('/users', Modules.usersRouter);
app.use('/categories', Modules.categoriesRouter);
app.use('/expenses', Modules.expensesRouter);
app.use('/incomes', Modules.incomesRouter);
app.use('/saving-goals', Modules.savingGoalsRouter);
app.use('/analytics', Modules.analyticsRouter);
app.use('/budgets', budgetsRouter);


app.use(errorHandlerMiddleware);
app.use(openAPIRouter);

app.listen(appEnv.PORT, () => {
    const { NODE_ENV, HOST, PORT } = appEnv;
    console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});