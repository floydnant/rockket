import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SearchPickerComponent } from './search-picker.component'
import { RxModule } from 'src/app/rx/rx.module'

describe('SearchPickerComponent', () => {
    let component: SearchPickerComponent<{ title: string }>
    let fixture: ComponentFixture<SearchPickerComponent<{ title: string }>>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SearchPickerComponent],
            imports: [RxModule],
        }).compileComponents()

        fixture = TestBed.createComponent(SearchPickerComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
