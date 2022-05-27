import { Injectable } from '@angular/core';
import { ThemeState, UiStateService } from './ui-state.service';

export type theme = 'dark' | 'light';

const getTheme = (isdark: boolean) => (isdark ? 'dark' : 'light');

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    constructor(private uiStateService: UiStateService) {
        this.themeState = this.uiStateService.getThemeState();

        if (this.themeState.updateOnSystemThemeChange) this.setTheme(getTheme(this.darkThemeMqMatches));
        else this.executeTheme();

        this.darkThemeMq.addEventListener('change', mqEvent => {
            if (this.themeState.updateOnSystemThemeChange) {
                this.setTheme(getTheme(mqEvent.matches));
                this.darkThemeMqMatches = mqEvent.matches;
            }
        });
    }

    private darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    private darkThemeMqMatches = this.darkThemeMq.matches;
    themeState: ThemeState;

    setTheme(theme: theme) {
        if (this.themeState.theme != theme) {
            this.themeState.theme = theme;
            this.uiStateService.setThemeState(this.themeState);
        }
        this.executeTheme();
    }
    toggleTheme = () => this.setTheme(this.themeState.theme == 'dark' ? 'light' : 'dark');

    toggleUpdateOnSystemThemeChange() {
        this.themeState.updateOnSystemThemeChange = !this.themeState.updateOnSystemThemeChange;
        this.uiStateService.setThemeState(this.themeState);

        if (this.themeState.updateOnSystemThemeChange) this.setTheme(getTheme(this.darkThemeMqMatches));
    }

    private executeTheme() {
        const root = document.querySelector<HTMLElement>(':root');
        root.dataset.theme = this.themeState.theme;
    }
}
