import { NotificationTypeEnum } from '@prisma/client';

import { AppEvents, eventBus, GoalReachedEventPayload } from '@/common/events';
import { NotificationsRepository } from './notifications.repository';

export class NotificationsService {
	constructor(private readonly notificationsRepository = new NotificationsRepository()) {
		eventBus.on(AppEvents.GOAL_REACHED, this.handleGoalReached.bind(this));
	}

	async create({
		userId,
		title,
		message,
		type,
		metadata,
	}: {
		userId: string;
		title: string;
		message: string;
		type: NotificationTypeEnum;
		metadata?: unknown;
	}) {
		return this.notificationsRepository.create({
			data: {
				userId,
				title,
				message,
				type,
				metadata: metadata as object,
			},
		});
	}

	private async handleGoalReached(payload: GoalReachedEventPayload) {
		await this.create({
			userId: payload.userId,
			title: 'Mục tiêu tiết kiệm đạt được',
			message: `Bạn đã hoàn thành mục tiêu tiết kiệm "${payload.title}". Chúc mừng!`,
			type: NotificationTypeEnum.GOAL_REACHED,
			metadata: {
				goalId: payload.goalId,
				title: payload.title,
			},
		});
	}
}
