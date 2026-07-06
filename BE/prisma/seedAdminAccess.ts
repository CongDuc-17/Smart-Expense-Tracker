import { PrismaClient, RoleEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'vunguyens3rd2919@gmail.com';
  const fixedJwt = 'FIXED_ADMIN_JWT_TOKEN_123';
  const adminPassword = 'quadbra1783@%$';
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);
  
  // 1. Tạo hoặc cập nhật ở bảng AdminAccess (dành cho Admin Login API)
  await prisma.adminAccess.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      jwtToken: fixedJwt,
      role: RoleEnum.ADMIN
    },
    create: {
      email,
      password: hashedPassword,
      jwtToken: fixedJwt,
      role: RoleEnum.ADMIN
    }
  });

  // 2. Cập nhật Frontend User Table (Phòng trường hợp đăng nhập bình thường)
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
  } else {
    await prisma.user.update({
      where: { email },
      data: { role: RoleEnum.ADMIN }
    });
  }

  console.log(`Seed Admin hoàn tất! Email: ${email} | Pass: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
