import { Request, Response } from 'express';
import { HttpResponseDto } from '@/common';
import { AdminUserService } from './admin.service';

class AdminController {
	constructor(
		private readonly adminUserService: AdminUserService = new AdminUserService(),
	) {
		this.getUsers = this.getUsers.bind(this);
		this.getUserById = this.getUserById.bind(this);
		this.updateUserStatus = this.updateUserStatus.bind(this);
		this.getSystemStats = this.getSystemStats.bind(this);
		this.seedCategories = this.seedCategories.bind(this);
	}

	async getUsers(req: Request, res: Response): Promise<Response> {
		const result = await this.adminUserService.findAll(req.query);
		return new HttpResponseDto().success(result);
	}

	async getUserById(req: Request, res: Response): Promise<Response> {
		const result = await this.adminUserService.findById(req.params.id as string);
		return new HttpResponseDto().success(result);
	}

	async updateUserStatus(req: Request, res: Response): Promise<Response> {
		const adminId = (req.user as any).id;
		const { id } = req.params;
		const { status } = req.body;
		const result = await this.adminUserService.updateStatus(adminId, id as string, status);
		return new HttpResponseDto().success(result);
	}

	async getSystemStats(req: Request, res: Response): Promise<Response> {
		const result = await this.adminUserService.getSystemStats();
		return new HttpResponseDto().success(result);
	}

	async seedCategories(req: Request, res: Response): Promise<Response> {
		const result = await this.adminUserService.seedDefaultCategories();
		return new HttpResponseDto().success(result);
	}
}

export default new AdminController();
