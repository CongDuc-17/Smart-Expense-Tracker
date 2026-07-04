import { SocketService } from '@/common';
import { AppEvents, eventBus, GoalReachedEventPayload } from '@/common/events';
import { CreateNotificationInternalDTO } from './dtos';
import { NotificationsRepository } from './notifications.repository';

export class NotificationsService {
	constructor(private readonly notificationsRepo = new NotificationsRepository()) {
		eventBus.on(AppEvents.GOAL_REACHED, this.handleGoalReached.bind(this));
	}

	private async handleGoalReached(payload: GoalReachedEventPayload) {
		try {
			await this.create({
				userId: payload.userId,
				title: 'Chúc mừng!',
				message: `Bạn đã đạt được mục tiêu tiết kiệm "${payload.title}"!`,
				type: 'GOAL_REACHED',
				metadata: { goalId: payload.goalId },
			});
		} catch (error) {
			console.error('Error handling GOAL_REACHED event in NotificationsService:', error);
		}
	}

	/**
	 * INTERNAL API: Create a notification and emit a socket event.
	 * This should NOT be exposed as a public REST API.
	 */
	async create(dto: CreateNotificationInternalDTO) {
		const notification = await this.notificationsRepo.create({
			userId: dto.userId,
			title: dto.title,
			message: dto.message,
			type: dto.type,
			metadata: dto.metadata ? JSON.parse(JSON.stringify(dto.metadata)) : undefined,
		});

		// Emit realtime event to the user's private room
		try {
			SocketService.getInstance().emitToUser(dto.userId, 'NEW_NOTIFICATION', notification);
		} catch (error) {
			console.error(`Failed to emit socket event for NEW_NOTIFICATION:`, error);
		}

		return notification;
	}

	async findAll(userId: string, isRead?: boolean, page: number = 1, limit: number = 20) {
		const skip = (page - 1) * limit;
		const { notifications, total, unreadCount } = await this.notificationsRepo.findAll(
			userId,
			isRead,
			skip,
			limit,
		);

		return {
			data: notifications,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
			unreadCount,
		};
	}

	async getUnreadCount(userId: string) {
		const count = await this.notificationsRepo.getUnreadCount(userId);
		return { count };
	}

	async markAsRead(userId: string, notificationId: string) {
		return this.notificationsRepo.markAsRead(userId, notificationId);
	}

	async markAllAsRead(userId: string) {
		const result = await this.notificationsRepo.markAllAsRead(userId);
		return { updatedCount: result.count };
	}
}
