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
        taskEvent: true,
        taskComment: true,
    })

    const snapshotDir = path.join(__dirname, 'snapshots')
    const filePath = path.join(snapshotDir, `snapshot-${Date.now()}.json`)

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
