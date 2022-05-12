import { fn } from '@angular/compiler/src/output/output_ast';
import { Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { DomChangesListenerDirective } from './dom-changes-listener.directive';

/** ## needs a little more work */
@Directive({
    selector: '[domValueAccessor]',
    host: {
        // '(change)': '_onChange($event.target.value)',
        '(blur)': 'onBlur()',
        '(focus)': 'onFocus()',
    },
})
export class DomValueAccessorDirective extends DomChangesListenerDirective implements ControlValueAccessor, OnChanges {
    constructor(private elemRef: ElementRef) {
        super(elemRef);
        this.domChangesOptions = {
            plainOnly: this.domValueAccessorOptions.plainOnly,
            observe: this.getObserveStatus(),
        };
        this.textChanges.subscribe(data => {
            console.log(data);
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ('domValueAccessorOptions' in changes) {
            this.domChangesOptions.observe = this.getObserveStatus();
        }
    }

    @Input()
    domValueAccessorOptions: {
        plainOnly: boolean;
        observe: boolean | 'onFocus';
    } = {
        plainOnly: true,
        observe: 'onFocus',
    };

    private getObserveStatus() {
        return this.domValueAccessorOptions.observe == 'onFocus'
            ? this.isFocused
            : this.domValueAccessorOptions.observe;
    }

    isFocused = false;
    onBlur() {
        this.isFocused = false;
        if (this.domValueAccessorOptions.observe == 'onFocus') this.domChangesOptions.observe = this.isFocused;
        this._onTouched();
    }
    onFocus() {
        this.isFocused = true;
        if (this.domValueAccessorOptions.observe == 'onFocus') this.domChangesOptions.observe = this.isFocused;
    }

    writeValue(value: any): void {
        // this._renderer.setProperty(this._elementRef.nativeElement, 'innerHTML', value);
        this.elemRef.nativeElement.innerHTML = value;
        console.log('value written');
    }

    _onChange: (value: any) => void;
    registerOnChange(fn: (value: any) => void): void {
        this._onChange = (...args) => {
            fn(...args);
            console.log('value changed');
        };
    }

    _onTouched: () => void;
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
        console.log('touched');
    }

    setDisabledState(isDisabled: boolean): void {
        console.warn('disabling might not work');
        this.elemRef.nativeElement.contenteditable = !isDisabled;
    }
}
