import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CommandPaletteComponent } from './command-palette.component'
import { DIALOG_DATA, DialogModule } from '@angular/cdk/dialog'
import { storeMock } from '../utils/unit-test.mocks'
import { NEVER } from 'rxjs'

describe('CommandPaletteComponent', () => {
    let component: CommandPaletteComponent
    let fixture: ComponentFixture<CommandPaletteComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogModule],
            declarations: [CommandPaletteComponent],
            providers: [storeMock, { provide: DIALOG_DATA, useValue: NEVER }],
        }).compileComponents()

        fixture = TestBed.createComponent(CommandPaletteComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
