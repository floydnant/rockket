import { DIALOG_DATA } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import { escapeForRegEx } from '@tiptap/core'
import {
    BehaviorSubject,
    Observable,
    Subject,
    animationFrames,
    combineLatest,
    distinctUntilChanged,
    first,
    map,
    shareReplay,
    switchMap,
} from 'rxjs'
import {
    CommandPalletteContext,
    CommandPalletteItem,
    CommandPalletteService,
} from './command-pallette.service'

const buildItemMatcher = (query: string) => {
    const regex = new RegExp(escapeForRegEx(query), 'i')
    return (commandItem: CommandPalletteItem) => {
        return regex.test(commandItem.title) || commandItem.keywords?.some(keyword => regex.test(keyword))
    }
}

@UntilDestroy()
@Component({
    selector: 'app-command-pallette',
    template: `
        <div
            (keydown)="this.onKeydown$.next($event)"
            class="app-overlay | shadow-dialog flex flex-col !rounded-[15px] p-2"
            [style.width]="'min(90vw,' + (width$ | async) + 'px)'"
            (click)="input.focus()"
            (document.click)="input.focus()"
        >
            <div class="flex items-center">
                <app-icon icon="search" class="text-tinted-500 ml-2 mr-1 text-sm"></app-icon>
                <input
                    #input
                    class="input | placeholder:text-tinted-400 !bg-opacity-0 px-2 py-1 ring-transparent"
                    type="text"
                    [placeholder]="placeholder$ | async"
                    (input)="searchQuery$.next(input.value)"
                    focusable
                    [autoFocus]="true"
                />
            </div>

            <app-search-picker
                class="[.app-overlay:has(li)_&]:mt-2"
                [results]="matchedItems$ | async"
                [keydownEvents$]="onKeydown$"
                (commitSelection)="onSelected($event)"
                maxBreadcrumbWidth="20ch"
                [maxHeight]="maxHeight$ | async"
            ></app-search-picker>
        </div>
    `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalletteComponent {
    private commandPalletteService = inject(CommandPalletteService)
    /** This is a replay subject, feel free to subscribe to it multiple times, no problem. */
    private context$: Observable<CommandPalletteContext> = inject(DIALOG_DATA)

    searchQuery$ = new BehaviorSubject<string>('')
    onKeydown$ = new Subject<KeyboardEvent>()

    placeholder$ = this.context$.pipe(map(context => context.placeholder))
    width$ = this.context$.pipe(map(context => context.width))
    maxHeight$ = this.context$.pipe(map(context => context.maxHeight))

    @ViewChild('input') input?: ElementRef<HTMLInputElement>
    focusInputSubscription = this.commandPalletteService.onShouldFocusPallette$
        .pipe(untilDestroyed(this))
        .subscribe(() => {
            this.input?.nativeElement.focus()
        })
    clearInputSubscription = this.context$.pipe(untilDestroyed(this)).subscribe(context => {
        if (!context.preserveSearchQuery) this.clearSearchQuery()
    })
    clearSearchQuery() {
        this.searchQuery$.next('')
        if (this.input?.nativeElement) this.input.nativeElement.value = ''
    }

    onSelected(item: CommandPalletteItem) {
        this.context$.pipe(first(), untilDestroyed(this)).subscribe(context => {
            context.enter(item)
        })
    }

    matchedItems$ = combineLatest([
        this.searchQuery$.pipe(
            coalesceWith(animationFrames()),
            map(v => v.trim()),
            distinctUntilChanged(),
        ),
        this.context$.pipe(switchMap(context => context.items$)),
        this.context$,
    ]).pipe(
        map(([searchQuery, items, { renderItemsOnEmptySearchQuery }]): CommandPalletteItem[] => {
            if (!searchQuery) return renderItemsOnEmptySearchQuery ? items : []

            return items.filter(buildItemMatcher(searchQuery))
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}
