import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
	constructor(private readonly notificationsService = new NotificationsService()) {}

	getNotifications = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req.user as any).id;
			const { isRead, page, limit } = req.query as any;

			const parsedPage = page ? parseInt(page as string, 10) : 1;
			const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
			const parsedIsRead = isRead !== undefined ? isRead === 'true' : undefined;

			const result = await this.notificationsService.findAll(userId, parsedIsRead, parsedPage, parsedLimit);

			res.status(StatusCodes.OK).json({
				status: 'success',
				data: result.data,
				pagination: result.pagination,
				unreadCount: result.unreadCount,
			});
		} catch (error) {
			next(error);
		}
	};

	getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req.user as any).id;
			const result = await this.notificationsService.getUnreadCount(userId);

			res.status(StatusCodes.OK).json({
				status: 'success',
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	markAsRead = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req.user as any).id;
			const { id } = req.params as any;

			const result = await this.notificationsService.markAsRead(userId, id);

			res.status(StatusCodes.OK).json({
				status: 'success',
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req.user as any).id;
			const result = await this.notificationsService.markAllAsRead(userId);

			res.status(StatusCodes.OK).json({
				status: 'success',
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};
}
