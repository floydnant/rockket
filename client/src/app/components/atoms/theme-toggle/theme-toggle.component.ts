import { Component } from '@angular/core';
import { theme, ThemeService } from 'src/app/services/theme.service';

@Component({
    selector: 'theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent {
    constructor(public themeService: ThemeService) {}

    activeTheme = this.themeService.themeState;

    setTheme = (theme: theme) => {
        this.themeService.setTheme(theme);
    };
    toggleUpdateThemeOnEvent() {
        this.themeService.toggleUpdateOnSystemThemeChange();
    }
}
