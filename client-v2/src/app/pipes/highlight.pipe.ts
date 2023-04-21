import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
    transform(text: string | null, highlight: string | null): string {
        if (!highlight || !text) return text ?? ''

        // @TODO: ignore HTML syntax, but include hrefs
        return text.replace(new RegExp(`${highlight}`, 'ig'), match => `<span class="highlight">${match}</span>`)
    }
}
