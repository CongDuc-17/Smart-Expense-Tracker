import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AdminUserService } from './admin.service';

class AdminController {
	constructor(private readonly adminUserService: AdminUserService = new AdminUserService()) {
		this.login = this.login.bind(this);
		this.getUsers = this.getUsers.bind(this);
		this.getUserById = this.getUserById.bind(this);
		this.updateUserStatus = this.updateUserStatus.bind(this);
		this.getSystemStats = this.getSystemStats.bind(this);
		this.seedCategories = this.seedCategories.bind(this);
	}

	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { email, password } = req.body;
			const result = await this.adminUserService.login(email, password);
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}

	async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.adminUserService.findAll(req.query);
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}

	async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.adminUserService.findById(req.params.id as string);
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}

	async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const adminId = (req.user as any).id;
			const { id } = req.params;
			const { status } = req.body;
			const result = await this.adminUserService.updateStatus(adminId, id as string, status);
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}

	async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.adminUserService.getSystemStats();
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}

	async seedCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.adminUserService.seedDefaultCategories();
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	}
}

export default new AdminController();
