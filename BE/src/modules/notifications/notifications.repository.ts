import { Prisma, PrismaService } from '../database';
import { NotificationTypeEnum } from '@prisma/client';

type CreateNotificationData = {
	userId: string;
	title: string;
	message: string;
	type: NotificationTypeEnum;
	metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
};

export class NotificationsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async create({ data }: { data: CreateNotificationData }) {
		return this.prismaService.notification.create({ data });
	}
}
