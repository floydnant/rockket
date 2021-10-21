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
        if (this.isDarkTheme) document.body.classList.remove('light');
        else document.body.classList.add('light');
    };
    toggleTheme = () => this.setTheme(!this.isDarkTheme);

    init = () => this.setTheme(this.isDarkTheme);

    ngOnInit(): void {
        this.init();
        this.darkThemeMq.addEventListener('change', mq => this.setTheme(mq.matches));
    }
}
