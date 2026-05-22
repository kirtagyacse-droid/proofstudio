const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const project = await prisma.project.findFirst({
    include: {
      user: {
        select: {
          completedFirstTestimonial: true,
          completedFirstContentPack: true,
          viewedWall: true,
        }
      }
    }
  });
  console.log(project);
}

main().catch(console.error).finally(() => prisma.$disconnect());
