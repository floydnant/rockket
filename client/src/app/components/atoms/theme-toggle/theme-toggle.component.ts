import { Component, OnInit, Output } from '@angular/core';

@Component({
    selector: 'theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.css'],
})
export class ThemeToggleComponent implements OnInit {
    darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    @Output() isDarkTheme = this.darkThemeMq.matches;

    setTheme = (shouldBeDarkTheme: boolean) => {
        this.isDarkTheme = shouldBeDarkTheme;
        localStorage.setItem('todo-theme-dark', shouldBeDarkTheme.toString());
        const root = document.querySelector(':root');
        if (this.isDarkTheme) {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    };
    toggleTheme = () => this.setTheme(!this.isDarkTheme);

    get updateThemeOnEvent() {
        const raw = localStorage.getItem("todo-theme-update")
        return raw == "false" ? false : true;
    }
    set updateThemeOnEvent(value: boolean) {
        localStorage.setItem("todo-theme-update", value.toString());
    }
    toggleUpdateThemeOnEvent() {
        this.updateThemeOnEvent = !this.updateThemeOnEvent
    }

    init = () => {
        const loadedTheme = localStorage.getItem('todo-theme-dark') == "false" ? false : true;
        this.setTheme(this.updateThemeOnEvent ? this.isDarkTheme : loadedTheme);
    };

    ngOnInit(): void {
        this.init();
        this.darkThemeMq.addEventListener('change', mq => this.updateThemeOnEvent && this.setTheme(mq.matches));
    }
}
