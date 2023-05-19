import { Editor, Extension, Range } from '@tiptap/core'
import CodeBlock from '@tiptap/extension-code-block'
import { getActiveListType } from './helpers'

interface IndentationOptions {
    /** Wether indentation logic should only be ran for code blocks.
     *
     * default: `false`
     */
    codeBlocksOnly?: boolean
    /** (For codeBlocks only)
     *
     * Wether a tab should be inserted at the cursor position or the beginning of the line.
     *
     * default: `false`
     */
    atCursorPos?: boolean
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indentation: {
            indent: (options?: IndentationOptions) => ReturnType
            outdent: (options?: IndentationOptions) => ReturnType
        }
    }
}

interface Position {
    inNode: number
    inDocument: number
}

interface Coordinates {
    nodeContent: string
    startOfLine: Position
    firstChar: Position
    cursor: Position
}

type ResolvedPos = Editor['state']['selection']['$anchor']
const getCoordinates = (anchor: ResolvedPos): Coordinates | null => {
    const nodeStart = anchor.start()
    const nodeEnd = anchor.end()
    const nodeContent = anchor.doc.textBetween(nodeStart, nodeEnd)

    const fromCursorToEnd = nodeEnd - anchor.pos
    let cursorPosInContent = nodeContent.length - 1 - fromCursorToEnd

    if (cursorPosInContent < 0) cursorPosInContent = 0

    let info: Coordinates | null = null

    // look for the first new line char before the cursor, i.e. start of the current line
    for (let i = cursorPosInContent; i >= 0; i--) {
        if (nodeContent[i] == '\n' || i == 0) {
            const firstChar = i == 0 ? 0 : i + 1

            info = {
                nodeContent,
                startOfLine: {
                    inNode: i,
                    inDocument: nodeStart + i,
                },
                firstChar: {
                    inNode: firstChar,
                    inDocument: nodeStart + firstChar,
                },
                cursor: {
                    inNode: nodeContent.length - fromCursorToEnd,
                    inDocument: anchor.pos,
                },
            }
            break
        }
    }
    return info
}

const getTabRangeToDelete = ({
    position,
    startOfLine,
    nodeContent,
    firstChar,
}: Omit<Coordinates, 'cursor'> & { position: Position }): Range | null => {
    /** wether to delete the range after the cursor, or before */
    const forwards = position.inDocument == firstChar.inDocument
    const startPosition = position.inDocument

    // @FIXME: blindly deleting the char at/before the cursor when there is a tab after the cursor is a bad approach

    // if there is a tab, remove it
    if (nodeContent[position.inNode] == '\t') {
        const from = forwards ? startPosition : startPosition - 1
        return { from, to: from + 1 }
    }

    // if there is a tab before the cursor, remove it
    if (nodeContent[position.inNode - 1] == '\t' && position.inNode != startOfLine.inNode) {
        const offset = forwards ? -1 : 0
        const from = (forwards ? startPosition : startPosition - 1) + offset
        return { from, to: from + 1 }
    }

    // @TODO: add support for spaces: if there are two/four spaces, remove them
    // const secondSpacePos = forwards ? position.inNode + 1 : position.inNode - 1
    // if (nodeContent[position.inNode] == ' ' && nodeContent[secondSpacePos] == ' ') {
    //     return {
    //         from: forwards ? deleteFrom : deleteFrom + 1,
    //         to: forwards ? deleteFrom + 1 : deleteFrom - 1,
    //     }
    // }

    return null
}

export const Indentation = Extension.create({
    name: 'indentation',

    addCommands() {
        // @TODO: add support for in/outdenting multiple lines at once

        return {
            indent: options => {
                const { codeBlocksOnly = false, atCursorPos = false } = options || {}

                return ({ editor, chain, state }) => {
                    if (!editor.isActive(CodeBlock.name)) {
                        if (codeBlocksOnly) return false

                        const type = getActiveListType(editor)?.item
                        if (!type) return false

                        return chain().sinkListItem(type).run()
                    }

                    if (atCursorPos) return chain().insertContent('\t').run()

                    const coords = getCoordinates(state.selection.$anchor)
                    if (!coords) return true

                    return chain().insertContentAt(coords.firstChar.inDocument, '\t', { updateSelection: false }).run()
                }
            },
            outdent: options => {
                const { codeBlocksOnly = false, atCursorPos = false } = options || {}

                return ({ editor, chain, state }) => {
                    if (!editor.isActive(CodeBlock.name)) {
                        if (codeBlocksOnly) return false

                        const type = getActiveListType(editor)?.item
                        if (!type) return false

                        return chain().liftListItem(type).run()
                    }

                    const coords = getCoordinates(state.selection.$anchor)
                    if (!coords) return true

                    const rangeToDelete = getTabRangeToDelete({
                        startOfLine: coords.startOfLine,
                        position: atCursorPos ? coords.cursor : coords.firstChar,
                        nodeContent: coords.nodeContent,
                        firstChar: coords.firstChar,
                    })

                    if (!rangeToDelete) return true
                    return chain().deleteRange(rangeToDelete).run()
                }
            },
        }
    },
    addKeyboardShortcuts(this) {
        return {
            Tab: () => this.editor.commands.indent({ codeBlocksOnly: true, atCursorPos: true }),
            'Shift-Tab': () => this.editor.commands.outdent({ codeBlocksOnly: true }),
        }
    },
})
