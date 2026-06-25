import * as nodemailer from 'nodemailer';

export const MailConfig = {
	smtpLogin: String(process.env.BREVO_SMTP_LOGIN),
	smtpKey: String(process.env.BREVO_SMTP_KEY),

	senderAddress:
		String(process.env.MAIL_SENDER_ADDRESS) ||
		'no-reply@localhost.com',

	senderName:
		String(process.env.MAIL_SENDER_NAME) ||
		'No Reply',
};

export const TransporterConfig = nodemailer.createTransport({
	host: 'smtp-relay.brevo.com',
	port: 587,
	secure: false,
	auth: {
		user: MailConfig.smtpLogin,
		pass: MailConfig.smtpKey,
	},
});