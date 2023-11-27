import { CdkMenuTrigger } from '@angular/cdk/menu'
import { OverlayModule } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Store } from '@ngrx/store'

import { UserMenuComponent } from './user-menu.component'

describe('UserMenuComponent', () => {
    let component: UserMenuComponent
    let fixture: ComponentFixture<UserMenuComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserMenuComponent],
            imports: [OverlayModule, CdkMenuTrigger],
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: Store, useValue: { subscribe() {}, select() {} } },
            ],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(UserMenuComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
