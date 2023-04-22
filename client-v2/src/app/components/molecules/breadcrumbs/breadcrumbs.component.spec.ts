import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BreadcrumbsComponent } from './breadcrumbs.component'
import { menuServiceMock } from 'src/app/utils/unit-test.mocks'

describe('BreadcrumbsComponent', () => {
    let component: BreadcrumbsComponent
    let fixture: ComponentFixture<BreadcrumbsComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BreadcrumbsComponent],
            providers: [menuServiceMock],
        }).compileComponents()

        fixture = TestBed.createComponent(BreadcrumbsComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
