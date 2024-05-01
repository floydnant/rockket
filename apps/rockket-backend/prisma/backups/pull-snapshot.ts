import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getSnapshot } from './snapshot.helpers'

const prisma = new PrismaClient()
const main = async () => {
    console.log('Pulling snapshot')
    const snapshot = await getSnapshot(prisma, {
        user: true,
        tasklist: true,
        listParticipant: true,
        task: true,
        entityEvent: true,
        taskComment: true,
    })

    const lastMigrationQueryRes: { migration_name: string }[] = await prisma.$queryRaw`
        SELECT "migration_name"
        FROM "_prisma_migrations"
        WHERE "rolled_back_at" IS NULL
        ORDER BY started_at DESC
        LIMIT 1;
    `
    const lastMigration = lastMigrationQueryRes[0].migration_name.replace(/^\d+_/g, '')
    console.log('Last applied migration:', lastMigration)

    const snapshotDir = path.join(__dirname, 'snapshots')
    const filePath = path.join(snapshotDir, `snapshot-${Date.now()}-${lastMigration}.json`)

    await fs.mkdir(snapshotDir, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(snapshot))

    console.log(`✅ Snapshot saved to ${filePath}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async e => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
