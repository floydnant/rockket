import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock } from 'src/app/utils/unit-test.mocks'
import { EntityViewComponent } from '../../organisms/entity-view/entity-view.component'

import { PageProgressBarComponent } from './page-progress-bar.component'

describe('TaskProgressBarComponent', () => {
    let component: PageProgressBarComponent
    let fixture: ComponentFixture<PageProgressBarComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageProgressBarComponent],
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: EntityViewComponent, useValue: { progress$: { next() {} } } },
                UiStateService,
                actionsMock,
            ],
        }).compileComponents()

        fixture = TestBed.createComponent(PageProgressBarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
