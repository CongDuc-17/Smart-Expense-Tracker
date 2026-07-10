import * as nodemailer from 'nodemailer';

export const MailConfig = {
	smtpLogin: String(process.env.EMAIL_USER),
	smtpKey: String(process.env.EMAIL_PASS),

	senderAddress: String(process.env.MAIL_SENDER_ADDRESS) || 'no-reply@localhost.com',

	senderName: String(process.env.MAIL_SENDER_NAME) || 'No Reply',
};

export const TransporterConfig = nodemailer.createTransport({
	host: String(process.env.MAIL_HOST),
	port: Number(process.env.MAIL_PORT),
	secure: false,
	auth: {
		user: MailConfig.smtpLogin,
		pass: MailConfig.smtpKey,
	},
});
