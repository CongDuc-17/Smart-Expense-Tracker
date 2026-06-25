import { SendMailOptions } from 'nodemailer';
import { SendEmailDto } from './dtos';
import { MailConfig, TransporterConfig } from '@/configs/mails.config';

export class MailsService {
	constructor() { }

	async sendEmail(
		data: SendEmailDto
	): Promise<{ success: boolean } | null> {
		try {
			const { sender, recipients, subject, html, text } = data;

			const fromAddress = sender
				? `"${sender.name}" <${sender.address}>`
				: `"${MailConfig.senderName}" <${MailConfig.senderAddress}>`;
			const payload: SendMailOptions = {
				from: fromAddress,
				to: recipients,
				subject,
				...(html && { html }),
				...(text && { text }),
			};
			await TransporterConfig.sendMail(payload);
			return { success: true };
		} catch (error) {
			return null;
		}
	}
}