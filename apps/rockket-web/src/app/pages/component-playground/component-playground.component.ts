import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { HotToastService } from '@ngneat/hot-toast'
import { DialogService } from 'src/app/modal/dialog.service'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'

@Component({
    selector: 'app-component-playground',
    templateUrl: './component-playground.component.html',
    styleUrls: ['./component-playground.component.css'],
})
export class ComponentPlaygroundComponent {
    constructor(private toast: HotToastService, private dialogService: DialogService) {
        this.toast.close('confirm-login')
    }

    fullnameControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(35)])

    formOptions: FormBuilderOptions = {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
        email: {
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
        },
        age: {
            name: 'Age (years old)',
            type: 'number',
            control: ['', [Validators.required, Validators.min(18)]],
            errorMessages: {
                min: 'You must be at least $value years old.',
            },
        },
        password: {
            name: 'New Password',
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        confirmPassword: {
            name: 'Confirm password',
            type: 'password',
            control: ['', matchSibling('password')],
            errorMessages: {
                notMatching: 'Passwords must match',
            },
        },
    }

    onSubmit(value: Record<string, string>) {
        console.log(value)
        this.isLoading = true
        setTimeout(() => {
            this.isLoading = false
        }, 4000)
    }
    isLoading = false

    openDestructiveModal = (() => {
        const dialogRef = this.dialogService.confirm({
            title: 'Delete account',
            text: `Are you sure you want to delete your account? Note that this action cannot be undone.`,
            buttons: [
                { text: 'Cancel' },
                {
                    text: 'I understand, delete',
                    resCode: 'Delete',
                    className: 'button--danger',
                },
            ],
        })

        dialogRef.closed.subscribe(res => {
            console.log(res)
        })
    }).bind(this)

    openDefaultModal = (() => {
        const dialogRef = this.dialogService.confirm({
            title: 'This is the default modal',
            text: `With some arbitrary text to keep the attention going, you can already see that it worked, because you are still reading this.`,
        })

        dialogRef.closed.subscribe(res => {
            console.log(res)
        })
    }).bind(this)

    openAlert = (() => {
        const dialogRef = this.dialogService.alert({
            title: 'This is the default alert',
            text: `With some arbitrary text to keep the attention going, you can already see that it worked, because you are still reading this.`,
        })

        dialogRef.closed.subscribe(res => {
            console.log(res)
        })
    }).bind(this)

    contextMenuOptions: MenuItem[] = [
        { title: 'Open destructive dialog', action: this.openDestructiveModal },
        { title: 'Open default dialog', action: this.openDefaultModal },
        { title: 'Open alert', action: this.openAlert },
    ]
}
