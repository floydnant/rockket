import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import fs from 'node:fs/promises'
import { argv } from 'node:process'
import { DbSnapshot } from './snapshot.helpers'
import { applySnapshot } from './snapshot.helpers'

const snapshotPath = argv[2]

const prisma = new PrismaClient()
const main = async () => {
    if (!snapshotPath) throw new Error('No snapshot path provided')

    console.log(`Pushing snapshot from ${snapshotPath}`)

    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf-8')) as DbSnapshot

    await applySnapshot(prisma, snapshot)

    console.log('✅ Snapshot pushed')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
