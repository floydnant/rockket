/* eslint-disable @typescript-eslint/no-explicit-any */

import { join } from 'path'
import { writeFile } from 'fs/promises'

const main = async () => {
    const contents = process.argv[2]
    if (!contents) {
        console.error('No input given')
        process.exit(1)
    }

    const seperatorString = '.'
    // @TODO: improve readability on this function
    const deflattenObject = (sourceObj: Record<string, string>) => {
        const resultObj: Record<string, any> = {}
        Object.entries(sourceObj).forEach(([concatenatedKeys, value]) => {
            const keys = concatenatedKeys.split(seperatorString)

            keys.reduce<{ lastObj: Record<string, any> }>(
                ({ lastObj }, currKey, index) => {
                    if (index == keys.length - 1) lastObj[currKey] = value
                    else
                        lastObj[currKey] = {
                            ...(lastObj[currKey] || {}),
                        }

                    return { lastObj: lastObj[currKey] }
                },
                { lastObj: resultObj },
            )
        })
        return resultObj
    }
    try {
        const parsed = JSON.parse(contents.replace(/\\n/g, '')) as Record<string, string>
        const newColors = deflattenObject(parsed)
        const filePath = join(__dirname, '../colors.json')

        try {
            await writeFile(filePath, JSON.stringify(newColors, null, 4))
            console.log(`\nWrote colors to ${filePath}`)
        } catch (err) {
            console.error(`Error writing to file ${filePath}`)
            console.error(err)
            process.exit(1)
        }
    } catch (err) {
        console.error(`Error parsing input`)
        console.error(err)
        process.exit(1)
    }
}

main()
