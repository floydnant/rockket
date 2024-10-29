import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SortingDropdownComponent } from './sorting-dropdown.component'
import { RxModule } from 'src/app/rx/rx.module'

describe(SortingDropdownComponent.name, () => {
    let component: SortingDropdownComponent
    let fixture: ComponentFixture<SortingDropdownComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RxModule],
            declarations: [SortingDropdownComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(SortingDropdownComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
