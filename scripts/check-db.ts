import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const cards = await prisma.card.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true
                }
            }
        }
    })

    console.log('--- Latest 10 Cards ---')
    cards.forEach(card => {
        console.log(`Card: ${card.cardName || 'N/A'} (ID: ${card.id})`)
        console.log(`  Owner: ${card.user?.fullName} (${card.user?.email})`)
        console.log(`  CreatedAt: ${card.createdAt}`)
        console.log(`  Status: ${card.status}, Active: ${card.cardActive}`)
        console.log('------------------------')
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
