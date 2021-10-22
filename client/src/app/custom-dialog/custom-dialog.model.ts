export interface customDialogCallProps {
    title: string;
    text?: string;
    buttons?: string[];
    defaultValue?: string;
}
export interface customDialogProps extends customDialogCallProps {
    type: 'confirm' | 'prompt';
}
export class defaultCustomDialogProps {
    title = '';
    text = '';
    buttons = [];
    type: 'confirm' | 'prompt' = 'prompt';
}
