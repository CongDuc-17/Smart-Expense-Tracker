import { PrismaClient, RoleEnum } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminAccounts = process.env.ADMIN_ACCOUNTS || 'admin@gmail.com:ankara2214';
  const accounts = adminAccounts.split(',');

  for (const account of accounts) {
    const [email, adminPassword] = account.split(':');
    
    if (!email || !adminPassword) {
      console.log(`Bỏ qua tài khoản không hợp lệ: ${account}`);
      continue;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Cập nhật Frontend User Table
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: 'Super Admin',
          role: RoleEnum.ADMIN,
          verify: true,
        }
      });
      
      await prisma.account.create({
        data: {
          userId: user.id,
          password: hashedPassword,
          salt,
        }
      });
      console.log(`Đã tạo mới Admin! Email: ${email}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { role: RoleEnum.ADMIN }
      });
      
      const existingAccount = await prisma.account.findUnique({ where: { userId: user.id } });
      if (existingAccount) {
        await prisma.account.update({
          where: { userId: user.id },
          data: { password: hashedPassword, salt }
        });
      } else {
        await prisma.account.create({
          data: {
            userId: user.id,
            password: hashedPassword,
            salt,
          }
        });
      }
      console.log(`Đã cập nhật Admin! Email: ${email}`);
    }
  }

  console.log('Seed Admin hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
