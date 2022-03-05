import { Injectable } from '@angular/core';
import { EditMenuComponent } from './edit-menu.component';
import { EditmenuTaskData, EditmenuTasklistData, responseHandlerInterface } from './edit-menu.model';

@Injectable({
    providedIn: 'root',
})
export class EditMenuService {
    editMenu: EditMenuComponent;
    responseHandler: (response: responseHandlerInterface) => void;
    private setResponseHandler<T extends EditmenuTaskData | EditmenuTasklistData>(
        resolve: (value: T) => void,
        reject: (reason?: string) => void
    ) {
        this.responseHandler = ({ updatedData, responseStatus }) => {
            switch (responseStatus) {
                case 'OK': resolve(updatedData as T); break;
                case 'Cancelled': reject('Cancelled'); break; 
                case 'Deleted': reject('Deleted'); break; 
            } //prettier-ignore
        };
    }

    editTaskDetails(data: EditmenuTaskData, noEdit = false, viewLinks = false): Promise<string | EditmenuTaskData> {
        this.editMenu.open({ data, type: 'Task', noEdit, viewLinks });
        return new Promise((resolve, reject) => {
            this.setResponseHandler<EditmenuTaskData>(resolve, reject);
        });
    }
    /** not implemented yet*/
    createTaskWithDetails() {}

    editTaskListDetails(data: EditmenuTasklistData, noEdit = false): Promise<string | EditmenuTasklistData> {
        this.editMenu.open({ data, type: 'TaskList', noEdit });
        return new Promise((resolve, reject) => {
            this.setResponseHandler<EditmenuTasklistData>(resolve, reject);
        });
    }
}
