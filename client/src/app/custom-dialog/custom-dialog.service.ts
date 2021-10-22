import { Injectable } from '@angular/core';
import { CustomDialogComponent } from './custom-dialog.component';
import { customDialogCallProps, customDialogProps } from './custom-dialog.model';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    dialog: CustomDialogComponent;
    return: (res: any) => void;

    confirm({ title, text, buttons }: customDialogCallProps): Promise<string> {
        return new Promise((resolve, reject) => {
            const props: customDialogProps = {
                title,
                text,
                buttons: buttons || ['OK'],
                type: 'confirm',
            };
            this.dialog.open(props);

            this.return = ({ buttons, resBtnIndex }) => {
                if (resBtnIndex == buttons.length - 1) resolve(buttons[resBtnIndex]);
                else reject(buttons[resBtnIndex]);
            };
        });
    }
    prompt({ title, text, buttons, defaultValue }: customDialogCallProps): Promise<string> {
        return new Promise((resolve, reject) => {
            const props: customDialogProps = {
                title,
                text,
                buttons: buttons || ['OK'],
                defaultValue,
                type: 'prompt',
            };
            this.dialog.open(props);

            this.return = ({ promptInput, buttons, resBtnIndex }) => {
                if (promptInput && resBtnIndex == buttons.length - 1) resolve(promptInput);
                else reject(buttons[resBtnIndex]);
            };
        });
    }
}

// export const custom = {
//     confirm({ title, text, buttons }: customDialogCallProps): Promise<string> {
//         return new Promise((resolve, reject) => {
//             const props: customDialogProps = {
//                 title,
//                 text,
//                 buttons: buttons || ['OK'],
//                 type: 'confirm',
//             };
//             DialogService.dialog.open(props);

//             DialogService.return = ({ buttons, resBtnIndex }) => {
//                 if (resBtnIndex == buttons.length - 1) resolve(buttons[resBtnIndex]);
//                 else reject(buttons[resBtnIndex]);
//             };
//         });
//     },
//     prompt({ title, text, buttons }: customDialogCallProps) {
//         return new Promise((resolve, reject) => {
//             const props: customDialogProps = {
//                 title,
//                 text,
//                 buttons: buttons || ['OK'],
//                 type: 'prompt',
//             };
//             DialogService.dialog.open(props);

//             DialogService.return = ({ promptInput, buttons, resBtnIndex }) => {
//                 if (promptInput && resBtnIndex == buttons.length - 1) resolve(promptInput);
//                 else reject('cancelled');
//             };
//         });
//     }
// };
