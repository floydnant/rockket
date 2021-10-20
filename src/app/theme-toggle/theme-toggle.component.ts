import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.css'],
})
export class ThemeToggleComponent implements OnInit {
    darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkTheme = this.darkThemeMq.matches;

    setTheme = (shouldBeDarkTheme: boolean) => {
        this.isDarkTheme = shouldBeDarkTheme;
        if (this.isDarkTheme) document.body.classList.remove('light');
        else document.body.classList.add('light');
    };
    toggleTheme = () => this.setTheme(!this.isDarkTheme);

    ngOnInit(): void {
        this.darkThemeMq.addListener(mq => this.setTheme(mq.matches));
    }
}
