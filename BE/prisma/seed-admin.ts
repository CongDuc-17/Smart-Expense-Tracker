import { PrismaClient, RoleEnum, UserStatusEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding Admin...');

	const email = process.env.EMAIL_ADMIN;
	const password = process.env.PASSWORD_ADMIN;

	if (!email || !password) {
		throw new Error('Please provide email and password for admin');
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const existingAdmin = await prisma.user.findUnique({
		where: { email },
	});

	if (existingAdmin) {
		console.log('Admin account already exists.');
		return;
	}

	await prisma.user.create({
		data: {
			email,
			name: 'Super Admin',
			role: RoleEnum.ADMIN,
			status: UserStatusEnum.ACTIVE,
			verify: true,
			account: {
				create: {
					password: hashedPassword,
					salt,
				},
			},
		},
	});

	console.log('✅ Admin account seeded successfully!');
	console.log('Email:', email);
	console.log('Password:', password);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
