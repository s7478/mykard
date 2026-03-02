const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            profileImage: true,
            createdAt: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
    });
    console.log(users);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
