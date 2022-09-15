/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

const { writeFile } = require('fs/promises')
const { join } = require('path')

const contents = process.argv[2]

const seperatorString = '.'
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
            { lastObj: resultObj }
        )
    })
    return resultObj
}
try {
    const parsed = JSON.parse(contents.replace(/\\n/g, ''))
    const newColors = deflattenObject(parsed)

    try {
        writeFile(join(__dirname, '../colors.json'), JSON.stringify(newColors, null, 4)).then(() =>
            console.log('\nUpdated colors!')
        )
    } catch (err) {
        console.error(`Error writing file:`, err)
    }
} catch (err) {
    console.error(`Error parsing input:`, err)
}
