import { Prisma } from '@prisma/client';
import { PrismaService } from '../database';

export class NotificationsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async create(data: Prisma.NotificationUncheckedCreateInput) {
		return this.prismaService.notification.create({
			data,
		});
	}

	async findAll(userId: string, isRead?: boolean, skip: number = 0, take: number = 20) {
		const whereClause: Prisma.NotificationWhereInput = {
			userId,
			...(isRead !== undefined ? { isRead } : {}),
		};

		const [notifications, total, unreadCount] = await this.prismaService.$transaction([
			this.prismaService.notification.findMany({
				where: whereClause,
				skip,
				take,
				orderBy: { createdAt: 'desc' },
			}),
			this.prismaService.notification.count({ where: whereClause }),
			this.prismaService.notification.count({ where: { userId, isRead: false } }),
		]);

		return { notifications, total, unreadCount };
	}

	async getUnreadCount(userId: string) {
		return this.prismaService.notification.count({
			where: { userId, isRead: false },
		});
	}

	async markAsRead(userId: string, notificationId: string) {
		return this.prismaService.notification.update({
			where: { id: notificationId, userId },
			data: { isRead: true, readAt: new Date() },
		});
	}

	async markAllAsRead(userId: string) {
		return this.prismaService.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true, readAt: new Date() },
		});
	}
}
