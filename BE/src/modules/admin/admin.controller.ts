import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AdminService } from './admin.service';

export class AdminController {
	constructor(private readonly adminService = new AdminService()) { }

	getUsers = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query = req.query as any;
			const result = await this.adminService.findAllUsers(query);

			res.status(StatusCodes.OK).json({
				success: true,
				...result,
			});
		} catch (error) {
			next(error);
		}
	};

	getUserById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.params.id as string;
			const result = await this.adminService.findUserById(userId);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const adminId = (req.user as any).id;
			const targetUserId = req.params.id as string;
			const { status } = req.body;

			const result = await this.adminService.updateUserStatus(adminId, targetUserId, status);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.adminService.getSystemStats();

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};
}
