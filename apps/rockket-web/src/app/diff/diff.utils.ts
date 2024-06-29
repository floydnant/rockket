// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import htmlDiff from 'htmldiff-js'

/** Renders the diff as html of the given contents with `<ins>` and `<del>` elements for insertions and deletions respectively. */
export const diffHtmlContent = htmlDiff.execute as (leftContents: string, rightContents: string) => string

// @TODO: this could probably be optimized
export const removeTags = (html: string, tagName: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    div.querySelectorAll(tagName).forEach(elem => elem.remove())

    return div.innerHTML
}

export const joinConsecutiveTags = (html: string, tagName: string) =>
    html.replace(new RegExp(`<\\/${tagName}>(\\s*)<${tagName}[^>]*>`, 'g'), '$1')
