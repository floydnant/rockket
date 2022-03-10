import { Injectable } from '@angular/core';

export class TaskUiState {
    collapseSubtaskList: boolean = false;
    collapseCompletedSubtasks: boolean = true;
    notesPopOutOpen: boolean = false;
}
class UiState {
    tasks: {
        [taskId: string]: TaskUiState;
    } = {};
}

@Injectable({
    providedIn: 'root',
})
export class UiStateService {
    constructor() {
        this.state = this.getUiState();
        console.log('ui state initialised');
    }
    private localStorageKey = 'todo-ui-state';

    getTaskState(taskId: string) {
        try {
            return this.state.tasks[taskId] || new TaskUiState();
        } catch (err) {
            return new TaskUiState();
        }
    }
    setTaskState(taskId: string, taskUiState: TaskUiState) {
        this.state.tasks[taskId] = taskUiState;
        this.setUiState();
    }

    private state: UiState = new UiState();
    private setUiState(state?: UiState) {
        if (state) this.state = state;
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.state));
    }
    private getUiState(): UiState {
        try {
            return JSON.parse(localStorage.getItem(this.localStorageKey)) || new UiState();
        } catch (err) {
            return new UiState();
        }
    }
}
