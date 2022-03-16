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

        if (this.themeState.updateOnSystemThemeChange) this.setTheme(getTheme(this.darkThemeMqMatches));
    }

    private executeTheme() {
        const root = document.querySelector(':root');
        if (this.themeState.theme == 'dark') {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    }
}
