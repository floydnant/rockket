import { CdkMenuModule } from '@angular/cdk/menu'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { actionsMock, activatedRouteMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { EntityPageComponent } from './entity-page.component'
import { BreadcrumbsComponent } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { RxModule } from 'src/app/rx/rx.module'
import { EntityViewComponent } from 'src/app/components/organisms/entity-view/entity-view.component'
import { IconsModule } from 'src/app/components/atoms/icons/icons.module'
import { MainPaneComponent } from 'src/app/components/templates/main-pane/main-pane.component'

describe('EntityPageComponent', () => {
    let component: EntityPageComponent
    let fixture: ComponentFixture<EntityPageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CdkMenuModule, RxModule, IconsModule],
            declarations: [EntityPageComponent, BreadcrumbsComponent, EntityViewComponent, MainPaneComponent],
            providers: [storeMock, activatedRouteMock, LoadingStateService, actionsMock],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
