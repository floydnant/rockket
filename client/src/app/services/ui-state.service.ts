import { Injectable } from '@angular/core';
import { Compare, getCopyOf } from '../shared/utility.model';
import { theme } from './theme.service';

export class TaskUiState {
    collapseSubtaskList: boolean = false;
    collapseCompletedSubtasks: boolean = true;

    detailsPopOut: {
        keepOpen: boolean;
        notesAreaHeight?: string;
        showLinks: boolean;
    } = {
        keepOpen: false,
        notesAreaHeight: null,
        showLinks: false,
    };
}
export class ThemeState {
    theme: theme = 'dark';
    updateOnSystemThemeChange: boolean = true;
}
class UiState {
    tasks: {
        [taskId: string]: TaskUiState;
    } = {};

    theme = new ThemeState();
}

@Injectable({
    providedIn: 'root',
})
export class UiStateService {
    constructor() {
        this.state = this.loadUiState();
    }
    private localStorageKey = 'todo-ui-state';
    private state: UiState = new UiState();
    private saveUiState() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.state));
        console.log('%cUI State updated', 'color: orange');
    }
    private loadUiState(): UiState {
        try {
            return JSON.parse(localStorage.getItem(this.localStorageKey)) || new UiState();
        } catch (err) {
            return new UiState();
        }
    }

    getTaskState(taskId: string) {
        try {
            return this.state.tasks[taskId] || new TaskUiState();
        } catch (err) {
            return new TaskUiState();
        }
    }
    setTaskState(taskId: string, taskUiState: TaskUiState) {
        this.state.tasks[taskId] = taskUiState;
        this.saveUiState();
    }

    getThemeState() {
        return this.state.theme || new ThemeState();
    }
    setThemeState(themeState: UiState['theme']) {
        this.state.theme = themeState;
        this.saveUiState();
    }
}
