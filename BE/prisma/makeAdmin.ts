import { PrismaClient, RoleEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'vunguyens3rd2919@gmail.com';
  
  // Update the user's role to ADMIN in the main User table
  const updatedUser = await prisma.user.updateMany({
    where: { email },
    data: { role: RoleEnum.ADMIN }
  });

  if (updatedUser.count > 0) {
    console.log(`Successfully updated ${email} to ADMIN role in User table.`);
  } else {
    console.log(`User ${email} not found in User table. Please register this email in the frontend first, then run this script again.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
