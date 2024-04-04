import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NotFoundPageComponent } from './not-found-page.component'
import { CenteredLayoutComponent } from 'src/app/components/templates/centered-layout/centered-layout.component'

describe('NotFoundComponent', () => {
    let component: NotFoundPageComponent
    let fixture: ComponentFixture<NotFoundPageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NotFoundPageComponent, CenteredLayoutComponent],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(NotFoundPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
