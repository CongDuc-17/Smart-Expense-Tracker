/**
 * SEED: DEFAULT CATEGORIES
 * Chạy: npx ts-node prisma/seed-categories.ts
 * (hoặc thêm vào package.json scripts)
 *
 * Tạo các danh mục mặc định cho hệ thống (isDefault = true, userId = null)
 * Script an toàn để chạy lại nhiều lần (upsert theo name + type + userId)
 */

import { PrismaClient, TransactionTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // ─── EXPENSE ───────────────────────────────────────────────────────────────
  { name: 'Ăn uống', type: TransactionTypeEnum.EXPENSE, icon: 'fast-food', color: '#FF5733' },
  { name: 'Di chuyển', type: TransactionTypeEnum.EXPENSE, icon: 'car', color: '#3498DB' },
  { name: 'Nhà ở', type: TransactionTypeEnum.EXPENSE, icon: 'home', color: '#8E44AD' },
  { name: 'Mua sắm', type: TransactionTypeEnum.EXPENSE, icon: 'cart', color: '#E91E63' },
  { name: 'Sức khoẻ', type: TransactionTypeEnum.EXPENSE, icon: 'medkit', color: '#2ECC71' },
  { name: 'Giải trí', type: TransactionTypeEnum.EXPENSE, icon: 'game-controller', color: '#F39C12' },
  { name: 'Giáo dục', type: TransactionTypeEnum.EXPENSE, icon: 'school', color: '#1ABC9C' },
  { name: 'Hoá đơn & Tiện ích', type: TransactionTypeEnum.EXPENSE, icon: 'receipt', color: '#95A5A6' },
  { name: 'Làm đẹp', type: TransactionTypeEnum.EXPENSE, icon: 'cut', color: '#FF69B4' },
  { name: 'Thú cưng', type: TransactionTypeEnum.EXPENSE, icon: 'paw', color: '#CD853F' },
  { name: 'Du lịch', type: TransactionTypeEnum.EXPENSE, icon: 'airplane', color: '#00BCD4' },
  { name: 'Khác (Chi)', type: TransactionTypeEnum.EXPENSE, icon: 'ellipsis-horizontal', color: '#BDC3C7' },

  // ─── INCOME ────────────────────────────────────────────────────────────────
  { name: 'Lương', type: TransactionTypeEnum.INCOME, icon: 'briefcase', color: '#27AE60' },
  { name: 'Thưởng', type: TransactionTypeEnum.INCOME, icon: 'trophy', color: '#F1C40F' },
  { name: 'Freelance', type: TransactionTypeEnum.INCOME, icon: 'laptop', color: '#3498DB' },
  { name: 'Đầu tư', type: TransactionTypeEnum.INCOME, icon: 'trending-up', color: '#16A085' },
  { name: 'Cho thuê', type: TransactionTypeEnum.INCOME, icon: 'key', color: '#8E44AD' },
  { name: 'Quà tặng', type: TransactionTypeEnum.INCOME, icon: 'gift', color: '#E74C3C' },
  { name: 'Khác (Thu)', type: TransactionTypeEnum.INCOME, icon: 'ellipsis-horizontal', color: '#BDC3C7' },
];

async function main() {
  console.log('🌱 Seeding default categories...');

  let created = 0;
  let skipped = 0;

  for (const category of defaultCategories) {
    // Kiểm tra xem category mặc định đã tồn tại chưa
    // (userId = null + unique constraint @@unique([name, type, userId]))
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        type: category.type,
        isDefault: true,
        userId: null,
      },
    });

    if (existing) {
      console.log(`  ⏭️  Skip: "${category.name}" (${category.type}) - đã tồn tại`);
      skipped++;
      continue;
    }

    await prisma.category.create({
      data: {
        ...category,
        isDefault: true,
        userId: null,
      },
    });
    console.log(`  ✅ Created: "${category.name}" (${category.type})`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
