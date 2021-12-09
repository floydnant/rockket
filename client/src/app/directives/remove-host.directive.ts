import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[remove-host]',
})
/**
 * ## removes the host element of a component from the DOM
 * doesn't always work
 */
export class RemoveHostDirective {
    constructor(private el: ElementRef) {}

    //wait for the component to render completely
    ngOnInit() {
        const nativeElement: HTMLElement = this.el.nativeElement;
        const parentElement: HTMLElement = nativeElement.parentElement;

        // move all children out of the element
        while (nativeElement.firstChild) {
            parentElement.insertBefore(nativeElement.firstChild, nativeElement);
        }
        // remove the empty element(the host)
        parentElement.removeChild(nativeElement);
    }
}
