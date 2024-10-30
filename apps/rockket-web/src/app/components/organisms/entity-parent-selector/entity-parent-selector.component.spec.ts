import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EntityType } from '@rockket/commons'
import { storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityParentSelectorComponent } from './entity-parent-selector.component'
import { RxModule } from 'src/app/rx/rx.module'

describe('EntityParentSelectorComponent', () => {
    let component: EntityParentSelectorComponent
    let fixture: ComponentFixture<EntityParentSelectorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogModule, RxModule],
            providers: [
                storeMock,
                { provide: DialogRef, useValue: {} as DialogRef },
                { provide: DIALOG_DATA, useValue: { id: 'some id', entityType: EntityType.Task } },
            ],
            declarations: [EntityParentSelectorComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityParentSelectorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
