export interface editmenuPropsTasklist {
    name: string;
    meta: {
        notes: string;
    };
}
export interface editmenuPropsTask extends editmenuPropsTasklist {
    priority: number;
    meta: {
        notes: string;
        links: string[];
    };
}
export interface editmenuProps {
    type: 'Task' | 'TaskList';
    noEdit: boolean;
    data: editmenuPropsTask | editmenuPropsTasklist;
}
